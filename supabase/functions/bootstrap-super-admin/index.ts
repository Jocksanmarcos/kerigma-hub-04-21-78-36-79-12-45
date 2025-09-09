import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Bootstrap constants (server-side only)
const ADMIN_EMAIL = "admin@cbnkerigma.org.br";
const ADMIN_PASSWORD = "Kerigma@2025#";
const ADMIN_NAME = "Administrador Principal";
const SUPER_ADMIN_DESCRIPTION = "Acesso total a todas as funcionalidades e configurações da plataforma.";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase environment variables" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1) Ensure Super Admin profile exists
    const { data: existingProfile, error: profileSelectError } = await supabase
      .from("profiles")
      .select("id")
      .eq("name", "Super Admin")
      .maybeSingle();

    if (profileSelectError) throw profileSelectError;

    let profileId = existingProfile?.id as string | undefined;

    if (!profileId) {
      const { data: insertedProfile, error: profileInsertError } = await supabase
        .from("profiles")
        .insert({ name: "Super Admin", description: SUPER_ADMIN_DESCRIPTION })
        .select("id")
        .single();
      if (profileInsertError) throw profileInsertError;
      profileId = insertedProfile.id;
    }

    // 1b) Link profile to ALL permissions
    const { data: permissions, error: permsError } = await supabase
      .from("permissions")
      .select("id");
    if (permsError) throw permsError;

    if (permissions && permissions.length > 0) {
      const rows = permissions.map((p: any) => ({
        profile_id: profileId,
        permission_id: p.id,
        granted: true,
      }));
      // Use upsert to avoid duplicates if rerun
      const { error: linkError } = await supabase
        .from("profile_permissions")
        .upsert(rows, { onConflict: "profile_id,permission_id" });
      if (linkError) throw linkError;
    }

    // 2) Create or fetch the Super Admin auth user
    let userId: string | undefined;
    const { data: createUserData, error: createUserError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: ADMIN_NAME,
        requires_password_change: true,
      },
    });

    if (createUserError) {
      // If user already exists, try to find it
      // Supabase doesn't provide getByEmail, so list and filter
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listError) throw listError;
      const found = listData.users.find((u: any) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
      if (!found) throw createUserError; // Real error, no existing user
      userId = found.id;
    } else {
      userId = createUserData.user?.id;
    }

    if (!userId) {
      throw new Error("Could not determine Super Admin user id");
    }

    // Enforce password change and confirm email on every bootstrap run
    const { error: updateUserError } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
      user_metadata: {
        full_name: ADMIN_NAME,
        requires_password_change: true,
      },
    });
    if (updateUserError) console.warn('Could not update admin user metadata:', updateUserError);

    // 2b) Ensure pessoas record exists and is linked
    const { data: existingPessoa, error: pessoaSelectError } = await supabase
      .from("pessoas")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (pessoaSelectError) throw pessoaSelectError;

    if (!existingPessoa) {
      const { error: pessoaInsertError } = await supabase
        .from("pessoas")
        .insert({
          user_id: userId,
          email: ADMIN_EMAIL,
          nome_completo: ADMIN_NAME,
          profile_id: profileId,
          created_at: new Date().toISOString(),
        });
      if (pessoaInsertError) throw pessoaInsertError;
    }

    // Ensure user has highest app role in user_roles (for UI access)
    const { error: roleUpsertError } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: "pastor", active: true }, { onConflict: "user_id" });
    if (roleUpsertError) throw roleUpsertError;

    const result = {
      status: "ok",
      profile_id: profileId,
      admin_email: ADMIN_EMAIL,
      message: "Super Admin setup completed (idempotent)",
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
