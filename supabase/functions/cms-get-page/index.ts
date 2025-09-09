import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  slug: string;
  ttlSeconds?: number; // cache TTL
}

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

    const { slug, ttlSeconds = 300 } = (await req.json()) as RequestBody;
    if (!slug) {
      return new Response(JSON.stringify({ error: "slug is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const { data: cached, error: cacheErr } = await supabase
      .from("seo_cache")
      .select("id, result, expires_at")
      .eq("slug", slug)
      .gt("expires_at", now.toISOString())
      .maybeSingle();

    if (!cacheErr && cached?.result) {
      return new Response(JSON.stringify(cached.result), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": `public, max-age=${ttlSeconds}` },
      });
    }

    // Fetch fresh content
    const { data: page, error: pageErr } = await supabase
      .from("site_pages")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (pageErr) throw pageErr;

    let blocks: any[] = [];
    if (page) {
      const { data: b, error: blockErr } = await supabase
        .from("content_blocks")
        .select("*")
        .eq("page_id", page.id)
        .order("order");
      if (blockErr) throw blockErr;
      blocks = b || [];
    }

    const result = { page, blocks };

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    // Upsert cache
    await supabase
      .from("seo_cache")
      .upsert({ slug, result, expires_at: expiresAt }, { onConflict: "slug" });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": `public, max-age=${ttlSeconds}` },
    });
  } catch (e: any) {
    console.error("cms-get-page error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
