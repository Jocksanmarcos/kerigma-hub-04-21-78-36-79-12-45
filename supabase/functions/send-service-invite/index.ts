import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitePayload {
  planoId: string;
  pessoaId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { planoId, pessoaId }: InvitePayload = await req.json();
    if (!planoId || !pessoaId) throw new Error("planoId e pessoaId são obrigatórios");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Supabase env vars ausentes");
    if (!RESEND_KEY) throw new Error("RESEND_API_KEY não configurada");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    const { data: pessoa, error: ePessoa } = await supabase
      .from('pessoas')
      .select('email, nome_completo')
      .eq('id', pessoaId)
      .maybeSingle();
    if (ePessoa) throw ePessoa;
    if (!pessoa?.email) throw new Error('E-mail do convidado não encontrado');

    const { data: plano, error: ePlano } = await supabase
      .from('culto_planos')
      .select('tema_culto, created_at')
      .eq('id', planoId)
      .maybeSingle();
    if (ePlano) throw ePlano;

    const resend = new Resend(RESEND_KEY);

    const html = `
      <div style="font-family: Arial, sans-serif">
        <h2>Convite para servir</h2>
        <p>Olá, ${pessoa?.nome_completo || 'servo'}!</p>
        <p>Você foi convidado para servir no culto <strong>${plano?.tema_culto || 'Sem tema'}</strong>.</p>
        <p>Por favor, acesse o Kerigma Hub para aceitar ou recusar o convite.</p>
        <p>Deus abençoe!</p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Kerigma Hub <convites@notifications.kerigma>",
      to: [pessoa.email],
      subject: `Convite para servir – ${plano?.tema_culto || ''}`,
      html,
    });

    return new Response(JSON.stringify({ ok: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-service-invite error:", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
