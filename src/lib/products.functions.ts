import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Public: list products with filters (no auth required)
const listSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  search: z.string().max(120).optional(),
  status: z.enum(["available", "sold", "reserved"]).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "liked"]).default("newest"),
  limit: z.number().int().min(1).max(60).default(24),
  offset: z.number().int().min(0).default(0),
});

export const listProducts = createServerFn({ method: "POST" })
  .inputValidator((d) => listSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("products")
      .select("id,title,price,currency,status,quantity,district,created_at,featured,category_id,product_images(image_url,is_featured,sort_order)")
      .neq("status", "pending");

    if (data.category_id) q = q.eq("category_id", data.category_id);
    if (data.status) q = q.eq("status", data.status);
    if (data.search) q = q.ilike("title", `%${data.search}%`);

    if (data.sort === "price_asc") q = q.order("price", { ascending: true });
    else if (data.sort === "price_desc") q = q.order("price", { ascending: false });
    else q = q.order("created_at", { ascending: false });

    q = q.range(data.offset, data.offset + data.limit - 1);
    const { data: rows, error } = await q;
    if (error) return { products: [], error: error.message };

    const products = (rows ?? []).map((r: any) => {
      const imgs = (r.product_images ?? []) as Array<{ image_url: string; is_featured: boolean; sort_order: number }>;
      const featured = imgs.find((i) => i.is_featured) ?? imgs.sort((a, b) => a.sort_order - b.sort_order)[0];
      return {
        id: r.id as string,
        title: r.title as string,
        price: Number(r.price),
        currency: r.currency as string,
        status: r.status as "available" | "sold" | "pending" | "reserved",
        quantity: (r.quantity as number | null) ?? null,
        district: (r.district as string | null) ?? null,
        featured_image: featured?.image_url ?? null,
        created_at: r.created_at as string,
      };
    });
    return { products, error: null };
  });

export const getProduct = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p, error } = await supabaseAdmin
      .from("products")
      .select("*, product_images(*), categories(id,name,slug)")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !p) return { product: null };
    // increment views
    await supabaseAdmin.from("products").update({ views_count: (p.views_count ?? 0) + 1 }).eq("id", data.id);
    const { count: likes } = await supabaseAdmin
      .from("product_likes")
      .select("*", { count: "exact", head: true })
      .eq("product_id", data.id);
    return { product: p, likes_count: likes ?? 0 };
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("categories")
    .select("id,name,slug,icon_url,sort_order")
    .eq("is_active", true)
    .order("sort_order");
  return { categories: data ?? [] };
});

const createProductSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(5000),
  price: z.number().min(0).max(1_000_000_000),
  currency: z.string().min(1).max(8).default("RWF"),
  category_id: z.string().uuid(),
  condition: z.string().max(60).optional().nullable(),
  brand: z.string().max(120).optional().nullable(),
  quantity: z.number().int().min(1).max(10000).default(1),
  tags: z.array(z.string().max(60)).max(20).default([]),
  district: z.string().max(120).optional().nullable(),
  sector: z.string().max(120).optional().nullable(),
  location_text: z.string().max(255).optional().nullable(),
  featured: z.boolean().default(false),
  extra_fields: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  images: z.array(z.object({ url: z.string().url(), public_id: z.string() })).min(3).max(10),
});

export const createProduct = createServerFn({ method: "POST" })
  .inputValidator((d) => createProductSchema.parse(d))
  .handler(async ({ data }) => {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const auth = getRequestHeader("authorization");
    if (!auth?.startsWith("Bearer ")) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const token = auth.replace("Bearer ", "");
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
    if (ue || !u.user) throw new Error("Unauthorized");

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", u.user.id);
    if (!roles || roles.length === 0) throw new Error("Forbidden — staff only");

    const { images, ...rest } = data;
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert({ ...rest, created_by: u.user.id })
      .select()
      .single();
    if (error || !product) throw new Error(error?.message ?? "Insert failed");

    const rows = images.map((img, i) => ({
      product_id: product.id,
      image_url: img.url,
      sort_order: i,
      is_featured: i === 0,
    }));
    const { error: imgErr } = await supabaseAdmin.from("product_images").insert(rows);
    if (imgErr) throw new Error(imgErr.message);

    return { ok: true, id: product.id };
  });

export const dashboardStats = createServerFn({ method: "POST" }).handler(async () => {
  const { getRequestHeader } = await import("@tanstack/react-start/server");
  const auth = getRequestHeader("authorization");
  if (!auth?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const token = auth.replace("Bearer ", "");
  const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
  if (ue || !u.user) throw new Error("Unauthorized");

  const [total, available, sold, pending, reserved, reports, clicks] = await Promise.all([
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }).eq("status", "available"),
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }).eq("status", "sold"),
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }).eq("status", "reserved"),
    supabaseAdmin.from("employee_reports").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("whatsapp_clicks").select("id", { count: "exact", head: true }),
  ]);

  return {
    totals: {
      products: total.count ?? 0,
      available: available.count ?? 0,
      sold: sold.count ?? 0,
      pending: pending.count ?? 0,
      reserved: reserved.count ?? 0,
      reports: reports.count ?? 0,
      whatsapp_clicks: clicks.count ?? 0,
    },
  };
});
