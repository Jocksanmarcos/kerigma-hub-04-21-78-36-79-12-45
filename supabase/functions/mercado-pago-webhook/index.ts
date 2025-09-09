import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!MERCADO_PAGO_ACCESS_TOKEN) throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env not configured");

    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const idParam = url.searchParams.get("id");

    let payload: any = {};
    try {
      payload = await req.json();
    } catch (_) {
      // some notifications send no JSON body, rely on query params
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Determine payment id
    const paymentId = payload?.data?.id || payload?.resource?.split("/").pop() || idParam;
    const notifType = payload?.type || payload?.topic || type;

    if (notifType && notifType.toString().includes("test")) {
      return new Response(JSON.stringify({ ok: true, test: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (notifType && notifType.toString().includes("payment") && paymentId) {
      const resp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}` },
      });
      const payment = await resp.json();

      if (!resp.ok) {
        console.error("Failed to fetch payment:", payment);
        return new Response(JSON.stringify({ error: "Payment fetch failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const status = payment.status as string; // approved, pending, rejected, canceled
      const amount = Number(payment.transaction_amount || 0);
      let ref = payment.external_reference as string | undefined;

      let inscricaoIds: string[] = [];
      if (ref) {
        try {
          const parsed = JSON.parse(ref);
          if (Array.isArray(parsed?.inscricao_ids)) {
            inscricaoIds = parsed.inscricao_ids;
          }
          
          // Handle donation data - NOVA LÓGICA DE INTEGRAÇÃO FINANCEIRA
          if (parsed?.fund_id || parsed?.donor_email) {
            console.log('=== PROCESSANDO DOAÇÃO PARA CENTRAL FINANCEIRA ===');
            console.log('Dados da doação:', parsed);
            
            // Buscar categoria de doação (receita)
            const { data: categoriaReceita } = await supabase
              .from('categorias_financeiras')
              .select('id')
              .eq('tipo', 'receita')
              .ilike('nome', '%doaç%')
              .maybeSingle();

            // Buscar conta padrão para registrar a doação
            const { data: contaPadrao } = await supabase
              .from('contas_bancarias')
              .select('id')
              .eq('ativa', true)
              .limit(1)
              .maybeSingle();

            // Preparar dados do lançamento financeiro
            const lancamentoData = {
              tipo: 'receita',
              descricao: `Doação Online - ${parsed.donor_name || 'Doador Anônimo'}${parsed.fund_name ? ` (${parsed.fund_name})` : ''}`,
              valor: amount,
              data_lancamento: new Date().toISOString().split('T')[0],
              forma_pagamento: 'mercado_pago',
              status: status === 'approved' ? 'confirmado' : 'pendente',
              observacoes: `Doação online via Mercado Pago\nID Transação: ${paymentId}\nDoador: ${parsed.donor_name}\nEmail: ${parsed.donor_email}${parsed.donor_phone ? `\nTelefone: ${parsed.donor_phone}` : ''}${parsed.message ? `\nMensagem: ${parsed.message}` : ''}`,
              conta_id: contaPadrao?.id,
              categoria_id: categoriaReceita?.id,
              numero_documento: paymentId,
              tags: ['doacao_online', 'mercado_pago', ...(parsed.fund_name ? [parsed.fund_name.toLowerCase().replace(/\s+/g, '_')] : [])],
              fundo_id: parsed.fund_id || null,
              campanha_id: parsed.campaign_id || null,
            };

            console.log('Dados do lançamento financeiro:', lancamentoData);

            if (status === 'approved') {
              // Inserir o lançamento financeiro
              const { data: lancamento, error: lancamentoError } = await supabase
                .from('lancamentos_financeiros_v2')
                .insert(lancamentoData)
                .select()
                .single();

              if (lancamentoError) {
                console.error('Erro ao inserir lançamento financeiro:', lancamentoError);
              } else {
                console.log('✅ Lançamento financeiro criado com sucesso:', lancamento.id);
                
                // Log de auditoria
                console.log(`DOAÇÃO PROCESSADA COM SUCESSO:
                - Valor: R$ ${amount.toFixed(2)}
                - Doador: ${parsed.donor_name} (${parsed.donor_email})
                - Fundo: ${parsed.fund_name || 'Geral'}
                - ID Transação: ${paymentId}
                - ID Lançamento: ${lancamento.id}
                - Data: ${new Date().toLocaleString('pt-BR')}`);
              }
            } else {
              console.log(`Doação pendente - Status: ${status}, não registrada na central financeira ainda`);
            }
            
            console.log('=== FIM DO PROCESSAMENTO DA DOAÇÃO ===');
          } else {
            // Call original donation processor for backward compatibility
            const { error: donationError } = await supabase.functions.invoke('donation-processor', {
              body: {
                fund_id: parsed.fund_id,
                fund_name: parsed.fund_name,
                donor_email: parsed.donor_email,
                donor_name: parsed.donor_name,
                message: parsed.message,
                amount: amount,
                payment_id: paymentId,
                payment_status: status
              }
            });
            
            if (donationError) {
              console.error('Error processing donation:', donationError);
            }
          }
        } catch (_) {
          // external_reference may be plain string (e.g., single id)
          inscricaoIds = [ref];
        }
      }

      if (inscricaoIds.length > 0) {
        const statusMap: Record<string, string> = {
          approved: "Confirmado",
          pending: "Pendente",
          in_process: "Pendente",
          rejected: "Cancelado",
          canceled: "Cancelado",
          refunded: "Cancelado",
          charged_back: "Cancelado",
        };

        const mappedStatus = statusMap[status] || "Pendente";

        const { error } = await supabase
          .from("evento_inscricoes")
          .update({ status_pagamento: mappedStatus, pagamento_valor: amount, pagamento_moeda: "BRL" })
          .in("id", inscricaoIds);

        if (error) {
          console.error("Failed to update inscricoes:", error);
        }
      }

      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Unknown notification type
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("mercado-pago-webhook error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
