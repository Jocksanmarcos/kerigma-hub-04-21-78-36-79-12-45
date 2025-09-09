import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');

    const { toEmail, name = 'Amigo(a)' } = await req.json();
    if (!toEmail) {
      return new Response(JSON.stringify({ error: 'toEmail é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resend = new Resend(RESEND_API_KEY);
    const html = `
      <div style="font-family: Arial, sans-serif">
        <h2>Teste de E-mail (Resend)</h2>
        <p>Olá, ${name}!</p>
        <p>Este é um envio de teste via Supabase Edge Function + Resend.</p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Kerigma Hub <no-reply@notifications.kerigma>",
      to: [toEmail],
      subject: "Teste de E-mail – Kerigma Hub",
      html,
    });

    return new Response(JSON.stringify({ ok: true, emailResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('send-test-email error:', e);
    return new Response(JSON.stringify({ error: e.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
