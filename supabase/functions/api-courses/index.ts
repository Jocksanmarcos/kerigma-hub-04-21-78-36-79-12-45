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

    // Try to fetch featured courses (destaque = true). If column doesn't exist, fallback to active recent courses
    let payload: any[] = [];

    // Attempt 1: destaque = true
    const { data: featured, error: featErr, status: featStatus } = await supabase
      .from("cursos")
      .select("id, nome, descricao, slug, created_at, ativo, ordem, destaque")
      .eq("ativo", true)
      .eq("destaque", true)
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(12);

    if (!featErr && featured) {
      payload = featured.map((c: any) => ({
        titulo: c.nome,
        descricao_curta: (c.descricao || "").slice(0, 140),
        imagem_url: c.imagem_url || null,
      }));
    } else {
      console.warn("api-courses: destaque not available or query failed (status)", featStatus, featErr?.message);
      const { data: fallback, error: fbErr } = await supabase
        .from("cursos")
        .select("id, nome, descricao, slug, created_at, ativo, ordem")
        .eq("ativo", true)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(12);
      if (fbErr) throw fbErr;
      payload = (fallback || []).map((c: any) => ({
        titulo: c.nome,
        descricao_curta: (c.descricao || "").slice(0, 140),
        imagem_url: null,
      }));
    }

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("api-courses error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
