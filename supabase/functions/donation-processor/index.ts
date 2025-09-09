import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables not configured");
    }

    const {
      fund_id,
      fund_name,
      donor_email,
      donor_name,
      message,
      amount,
      payment_id,
      payment_status
    } = await req.json();

    console.log('Processing donation:', { fund_name, donor_email, donor_name, amount, payment_status });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if donation already exists to avoid duplicates
    const { data: existingDonation } = await supabase
      .from('doacoes')
      .select('id')
      .eq('payment_id', payment_id)
      .maybeSingle();

    if (existingDonation) {
      // Update existing donation status
      const { error: updateError } = await supabase
        .from('doacoes')
        .update({ 
          payment_status,
          updated_at: new Date().toISOString() 
        })
        .eq('payment_id', payment_id);

      if (updateError) {
        console.error('Error updating donation:', updateError);
        throw updateError;
      }

      console.log('Donation status updated successfully');
      return new Response(JSON.stringify({ 
        success: true, 
        action: 'updated' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get fund details if fund_id is provided
    let finalFundId = fund_id;
    if (!finalFundId && fund_name) {
      const { data: fundData } = await supabase
        .from('fundos_contabeis')
        .select('id')
        .eq('nome', fund_name)
        .eq('ativo', true)
        .maybeSingle();
      
      finalFundId = fundData?.id;
    }

    // Create new donation record
    const donationData = {
      fundo_id: finalFundId,
      nome_fundo: fund_name || 'Doação Geral',
      nome_doador: donor_name,
      email_doador: donor_email,
      mensagem: message,
      valor: amount,
      payment_id,
      payment_status,
      metodo_pagamento: 'mercado_pago'
    };

    const { data: donation, error: insertError } = await supabase
      .from('doacoes')
      .insert(donationData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating donation:', insertError);
      throw insertError;
    }

    console.log('Donation created successfully:', donation.id);

    // If payment is approved, create financial entry
    if (payment_status === 'approved' && finalFundId) {
      try {
        const { error: financialError } = await supabase
          .from('lancamentos_financeiros_v2')
          .insert({
            tipo: 'receita',
            descricao: `Doação online - ${donor_name}`,
            valor: amount,
            data_lancamento: new Date().toISOString().split('T')[0],
            status: 'confirmado',
            forma_pagamento: 'mercado_pago',
            fundo_id: finalFundId,
            observacoes: `Doação processada via Mercado Pago - ID: ${payment_id}`,
            tags: ['doacao_online', 'mercado_pago']
          });

        if (financialError) {
          console.error('Error creating financial entry:', financialError);
          // Don't throw here, donation was created successfully
        } else {
          console.log('Financial entry created successfully');
        }
      } catch (finError) {
        console.error('Error in financial processing:', finError);
        // Don't throw here, donation was created successfully
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      donation_id: donation.id,
      action: 'created' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error processing donation:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || "Erro interno do servidor" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});