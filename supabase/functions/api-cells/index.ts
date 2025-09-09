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

    // Get active cells with valid coordinates
    const { data: cells, error } = await supabase
      .from("celulas")
      .select("id, nome, latitude, longitude, lider_id, ativa")
      .eq("ativa", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    if (error) throw error;

    // Map leader names via a single batched query
    const liderIds = Array.from(new Set((cells || []).map((c: any) => c.lider_id).filter(Boolean)));
    let liderMap: Record<string, string> = {};
    if (liderIds.length > 0) {
      const { data: leaders, error: peopleErr } = await supabase
        .from("pessoas")
        .select("id, nome_completo")
        .in("id", liderIds);
      if (!peopleErr && leaders) {
        liderMap = leaders.reduce((acc: Record<string, string>, p: any) => {
          acc[p.id] = p.nome_completo;
          return acc;
        }, {});
      } else if (peopleErr) {
        console.warn("api-cells: pessoas lookup failed", peopleErr.message);
      }
    }

    const payload = (cells || []).map((c: any) => ({
      nome_celula: c.nome,
      latitude: c.latitude,
      longitude: c.longitude,
      lider_nome: (c.lider_id && liderMap[c.lider_id]) || null,
    }));

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("api-cells error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
