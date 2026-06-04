import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Idempotently creates the default Super Admin on first call.
// Email: admin@elimitrust.com / Password: Admin@2026
export const bootstrapSuperAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const EMAIL = "admin@elimitrust.com";
  const PASSWORD = "Admin@2026";

  // Check if a super_admin already exists in user_roles
  const { data: existing } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "super_admin")
    .limit(1);
  if (existing && existing.length > 0) {
    return { ok: true, created: false };
  }

  // Find or create the auth user
  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  let userId = list?.users.find((u) => u.email === EMAIL)?.id;

  if (!userId) {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Super Admin" },
    });
    if (error || !created.user) {
      return { ok: false, error: error?.message ?? "create user failed" };
    }
    userId = created.user.id;
  }

  // Ensure profile + force password change flag
  await supabaseAdmin.from("profiles").upsert({
    id: userId,
    email: EMAIL,
    full_name: "Super Admin",
    must_change_password: true,
    is_active: true,
  });

  // Assign super_admin role
  await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: userId, role: "super_admin" });

  return { ok: true, created: true };
});

const createEmployeeSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  full_name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional().nullable(),
});

export const createEmployee = createServerFn({ method: "POST" })
  .inputValidator((d) => createEmployeeSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireSupabaseAuth } = await import("@/integrations/supabase/auth-middleware");
    // We can't use middleware mid-handler — do auth manually using request bearer
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const auth = getRequestHeader("authorization");
    if (!auth?.startsWith("Bearer ")) throw new Error("Unauthorized");
    void requireSupabaseAuth;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const token = auth.replace("Bearer ", "");
    const { data: claims, error: ce } = await supabaseAdmin.auth.getUser(token);
    if (ce || !claims.user) throw new Error("Unauthorized");

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", claims.user.id);
    if (!roles?.some((r) => r.role === "super_admin")) throw new Error("Forbidden");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error || !created.user) throw new Error(error?.message ?? "create failed");

    await supabaseAdmin.from("profiles").upsert({
      id: created.user.id,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone ?? null,
      must_change_password: true,
    });
    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "employee" });

    return { ok: true, user_id: created.user.id };
  });
