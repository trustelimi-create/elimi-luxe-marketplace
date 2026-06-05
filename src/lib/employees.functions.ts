import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function adminCtx() {
  const { requireSuperAdmin } = await import("@/lib/auth-helpers.server");
  return requireSuperAdmin();
}

export const listEmployees = createServerFn({ method: "POST" }).handler(async () => {
  await adminCtx();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: roles, error: re } = await supabaseAdmin
    .from("user_roles")
    .select("user_id, role");
  if (re) throw new Error(re.message);
  const ids = Array.from(new Set((roles ?? []).map((r) => r.user_id)));
  if (ids.length === 0) return { employees: [] };
  const { data: profiles, error: pe } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, phone, is_active, must_change_password, created_at")
    .in("id", ids);
  if (pe) throw new Error(pe.message);
  const byUser = new Map<string, Array<"super_admin" | "employee">>();
  (roles ?? []).forEach((r) => {
    const arr = byUser.get(r.user_id) ?? [];
    arr.push(r.role as "super_admin" | "employee");
    byUser.set(r.user_id, arr);
  });
  const employees = (profiles ?? []).map((p) => ({
    ...p,
    roles: byUser.get(p.id) ?? [],
  }));
  return { employees };
});

const updateProfileSchema = z.object({
  user_id: z.string().uuid(),
  full_name: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().max(40).nullable().optional(),
});

export const updateEmployeeProfile = createServerFn({ method: "POST" })
  .inputValidator((d) => updateProfileSchema.parse(d))
  .handler(async ({ data }) => {
    await adminCtx();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { user_id, ...patch } = data;
    const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setEmployeeActive = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ user_id: z.string().uuid(), is_active: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { user } = await adminCtx();
    if (data.user_id === user.id && !data.is_active)
      throw new Error("You cannot suspend yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: data.is_active })
      .eq("id", data.user_id);
    if (error) throw new Error(error.message);
    // Also sign-out / ban the auth user when suspended; restore when activated.
    const banDuration = data.is_active ? "none" : "876000h"; // ~100y
    await supabaseAdmin.auth.admin.updateUserById(data.user_id, {
      ban_duration: banDuration,
    });
    return { ok: true };
  });

export const setEmployeeRole = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ user_id: z.string().uuid(), role: z.enum(["super_admin", "employee"]) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { user } = await adminCtx();
    if (data.user_id === user.id && data.role !== "super_admin")
      throw new Error("You cannot demote yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // remove all existing roles, then set target role
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.user_id, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resetEmployeePassword = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ user_id: z.string().uuid(), password: z.string().min(8).max(128) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await adminCtx();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", data.user_id);
    return { ok: true };
  });

export const deleteEmployee = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { user } = await adminCtx();
    if (data.user_id === user.id) throw new Error("You cannot delete yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
