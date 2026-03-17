import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const adminEmail = "admin@citylayers.com";
  const adminPassword = "admin";

  // Check if admin user already exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  let adminUser = existingUsers?.users?.find((u) => u.email === adminEmail);

  if (!adminUser) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: "Admin" },
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    adminUser = data.user;
  }

  // Ensure admin role exists
  const { data: existingRole } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", adminUser!.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!existingRole) {
    await supabaseAdmin.from("user_roles").insert({ user_id: adminUser!.id, role: "admin" });
  }

  return new Response(JSON.stringify({ success: true, user_id: adminUser!.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
