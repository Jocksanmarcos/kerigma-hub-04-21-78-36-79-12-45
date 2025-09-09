import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) {
      throw new Error("Supabase env vars missing");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Fetch base site URL for building links
    let siteUrl = "";
    const { data: site, error: siteErr } = await supabase.rpc("get_site_url");
    if (siteErr) {
      console.warn("api-events: get_site_url error", siteErr);
      siteUrl = "";
    } else {
      siteUrl = (site as string) || "";
    }

    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("eventos")
      .select("id, titulo, data_inicio, cover_image_url, publico")
      .eq("publico", true)
      .gte("data_inicio", nowIso)
      .order("data_inicio", { ascending: true })
      .limit(3);

    if (error) throw error;

    const payload = (data || []).map((e: any) => ({
      titulo: e.titulo,
      data_hora_inicio: e.data_inicio,
      imagem_url: e.cover_image_url || null,
      link_inscricao: siteUrl ? `${siteUrl}/eventos/${e.id}` : `/eventos/${e.id}`,
    }));

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("api-events error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
