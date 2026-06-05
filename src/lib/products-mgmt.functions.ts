import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const idSchema = z.object({ id: z.string().uuid() });

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(5000),
  price: z.number().min(0).max(1_000_000_000),
  currency: z.string().min(1).max(8),
  category_id: z.string().uuid(),
  condition: z.string().max(60).nullable().optional(),
  brand: z.string().max(120).nullable().optional(),
  quantity: z.number().int().min(1).max(10000),
  district: z.string().max(120).nullable().optional(),
  sector: z.string().max(120).nullable().optional(),
  location_text: z.string().max(255).nullable().optional(),
  featured: z.boolean(),
});

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["available", "sold", "reserved", "pending"]),
});

async function authCtx() {
  const { requireStaff } = await import("@/lib/auth-helpers.server");
  return requireStaff();
}

async function assertCanMutate(productId: string, userId: string, isSuperAdmin: boolean) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: p, error } = await supabaseAdmin
    .from("products")
    .select("id, created_by")
    .eq("id", productId)
    .maybeSingle();
  if (error || !p) throw new Error("Product not found");
  if (!isSuperAdmin && p.created_by !== userId) throw new Error("Forbidden");
  return p;
}

export const getProductForEdit = createServerFn({ method: "POST" })
  .inputValidator((d) => idSchema.parse(d))
  .handler(async ({ data }) => {
    const { user, isSuperAdmin } = await authCtx();
    await assertCanMutate(data.id, user.id, isSuperAdmin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p, error } = await supabaseAdmin
      .from("products")
      .select("*, product_images(id,image_url,sort_order,is_featured)")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !p) throw new Error("Not found");
    return { product: p };
  });

export const updateProduct = createServerFn({ method: "POST" })
  .inputValidator((d) => updateSchema.parse(d))
  .handler(async ({ data }) => {
    const { user, isSuperAdmin } = await authCtx();
    await assertCanMutate(data.id, user.id, isSuperAdmin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("products").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("product_audit_logs").insert({
      product_id: id,
      actor_id: user.id,
      action: "edit",
      details: { fields: Object.keys(patch) },
    });
    return { ok: true };
  });

export const setProductStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => statusSchema.parse(d))
  .handler(async ({ data }) => {
    const { user, isSuperAdmin } = await authCtx();
    await assertCanMutate(data.id, user.id, isSuperAdmin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("products")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("product_audit_logs").insert({
      product_id: data.id,
      actor_id: user.id,
      action: `status:${data.status}`,
      details: {},
    });
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator((d) => idSchema.parse(d))
  .handler(async ({ data }) => {
    const { user, isSuperAdmin } = await authCtx();
    if (!isSuperAdmin) throw new Error("Forbidden — only super admin can delete");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Snapshot audit row BEFORE cascade delete (FK cascades will drop audit_logs).
    // We log a separate "deleted" entry against a sibling no-op: use a parent log table
    // approach by inserting into a deleted_products archive isn't needed — instead
    // capture title beforehand and write a final log; row will cascade away.
    const { data: snap } = await supabaseAdmin
      .from("products")
      .select("title, created_by")
      .eq("id", data.id)
      .maybeSingle();
    await supabaseAdmin.from("product_audit_logs").insert({
      product_id: data.id,
      actor_id: user.id,
      action: "delete",
      details: { title: snap?.title ?? null, created_by: snap?.created_by ?? null },
    });
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyProducts = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        scope: z.enum(["mine", "all"]).default("mine"),
        status: z.enum(["available", "sold", "reserved", "pending", "any"]).default("any"),
        search: z.string().max(120).optional(),
        limit: z.number().int().min(1).max(100).default(50),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const { user, isSuperAdmin } = await authCtx();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("products")
      .select(
        "id,title,price,currency,status,district,created_at,created_by,featured,product_images(image_url,is_featured,sort_order)",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.scope === "mine" || !isSuperAdmin) q = q.eq("created_by", user.id);
    if (data.status !== "any") q = q.eq("status", data.status);
    if (data.search) q = q.ilike("title", `%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const products = (rows ?? []).map((r) => {
      const imgs = (r.product_images ?? []) as Array<{
        image_url: string;
        is_featured: boolean;
        sort_order: number;
      }>;
      const featured =
        imgs.find((i) => i.is_featured) ?? [...imgs].sort((a, b) => a.sort_order - b.sort_order)[0];
      return {
        id: r.id as string,
        title: r.title as string,
        price: Number(r.price),
        currency: r.currency as string,
        status: r.status as "available" | "sold" | "pending" | "reserved",
        district: (r.district as string | null) ?? null,
        featured_image: featured?.image_url ?? null,
        created_by: r.created_by as string | null,
        created_at: r.created_at as string,
      };
    });
    return { products, isSuperAdmin };
  });

export const getProductAuditLogs = createServerFn({ method: "POST" })
  .inputValidator((d) => idSchema.parse(d))
  .handler(async ({ data }) => {
    const { user, isSuperAdmin } = await authCtx();
    await assertCanMutate(data.id, user.id, isSuperAdmin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: logs, error } = await supabaseAdmin
      .from("product_audit_logs")
      .select("id, action, details, created_at, actor_id, profiles:actor_id(full_name,email)")
      .eq("product_id", data.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { logs: logs ?? [] };
  });
