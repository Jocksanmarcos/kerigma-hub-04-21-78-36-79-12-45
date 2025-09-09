import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { corsHeaders } from "../_shared/cors.ts";

interface DonationRequest {
  donationAmount: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  fundName?: string;
  fundId?: string;
  campaignId?: string;
  message?: string;
  isRecurring?: boolean;
}

// Helper function to get fund ID by name
async function getFundId(fundName: string): Promise<string | null> {
  if (!fundName) return null;
  
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const { data } = await supabase
    .from('fundos_contabeis')
    .select('id')
    .eq('nome', fundName)
    .eq('ativo', true)
    .maybeSingle();
    
  return data?.id || null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log('=== INÍCIO DA CRIAÇÃO DE PREFERÊNCIA MERCADO PAGO ===');
    
    const requestData: DonationRequest = await req.json();
    console.log('Dados recebidos:', requestData);
    
    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");

    if (!accessToken) {
      console.error('Token do Mercado Pago não configurado');
      throw new Error("Token de acesso do Mercado Pago não configurado.");
    }

    // Validações
    if (!requestData.donationAmount || requestData.donationAmount <= 0) {
      throw new Error("Valor da doação inválido.");
    }

    if (!requestData.donorName || !requestData.donorEmail) {
      throw new Error("Nome e email são obrigatórios.");
    }

    console.log('Criando preferência Mercado Pago:', { 
      donationAmount: requestData.donationAmount, 
      donorName: requestData.donorName, 
      donorEmail: requestData.donorEmail, 
      fundName: requestData.fundName 
    });

    // Buscar ID do fundo se não fornecido
    const fundId = requestData.fundId || await getFundId(requestData.fundName || '');

    const preference = {
      items: [
        {
          title: `Doação para ${requestData.fundName || 'CBN Kerigma'} - ${requestData.donorName}`,
          description: requestData.message || 'Doação para apoiar o ministério',
          quantity: 1,
          unit_price: Number(requestData.donationAmount),
          currency_id: "BRL",
        },
      ],
      payer: {
        name: requestData.donorName,
        email: requestData.donorEmail,
        phone: requestData.donorPhone ? {
          area_code: "",
          number: requestData.donorPhone
        } : undefined
      },
      back_urls: {
        success: "https://d96b691c-9a8c-4f23-bf26-6c6cdc3e4848.lovableproject.com/semear/success",
        failure: "https://d96b691c-9a8c-4f23-bf26-6c6cdc3e4848.lovableproject.com/semear/failure",
        pending: "https://d96b691c-9a8c-4f23-bf26-6c6cdc3e4848.lovableproject.com/semear/pending",
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_types: [],
        installments: 12
      },
      notification_url: "https://vsanvmekqtfkbgmrjwoo.supabase.co/functions/v1/mercado-pago-webhook",
      external_reference: JSON.stringify({
        fund_id: fundId,
        fund_name: requestData.fundName,
        donor_email: requestData.donorEmail,
        donor_name: requestData.donorName,
        donor_phone: requestData.donorPhone,
        campaign_id: requestData.campaignId,
        message: requestData.message || "Doação online",
        is_recurring: requestData.isRecurring || false,
        timestamp: new Date().toISOString()
      }),
    };

    console.log('Enviando preferência para API Mercado Pago...');

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    console.log('Status da resposta da API Mercado Pago:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro da API do Mercado Pago:", errorData);
      throw new Error(`Erro ao criar preferência de pagamento: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Preferência Mercado Pago criada com sucesso:', data.id);
    console.log('=== FIM DA CRIAÇÃO DE PREFERÊNCIA ===');
    
    return new Response(JSON.stringify({ 
      success: true,
      checkoutUrl: data.init_point || data.sandbox_init_point,
      preferenceId: data.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Erro ao criar preferência Mercado Pago:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || "Erro interno do servidor" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});