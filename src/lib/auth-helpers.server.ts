// Server-only auth helpers. Never import from client/route modules at module scope;
// import dynamically inside server-fn handlers only.
import { getRequestHeader } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function requireUser() {
  const auth = getRequestHeader("authorization");
  if (!auth?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const token = auth.replace("Bearer ", "");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized");
  return data.user;
}

export async function getRoles(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return (data ?? []).map((r) => r.role as "super_admin" | "employee");
}

export async function requireStaff() {
  const user = await requireUser();
  const roles = await getRoles(user.id);
  if (roles.length === 0) throw new Error("Forbidden — staff only");
  return { user, roles, isSuperAdmin: roles.includes("super_admin") };
}

export async function requireSuperAdmin() {
  const ctx = await requireStaff();
  if (!ctx.isSuperAdmin) throw new Error("Forbidden — super admin only");
  return ctx;
}
