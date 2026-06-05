import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  getProductForEdit,
  updateProduct,
  getProductAuditLogs,
} from "@/lib/products-mgmt.functions";
import { listCategories } from "@/lib/products.functions";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/products/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Product — Elimi Trust" }] }),
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const fetchOne = useServerFn(getProductForEdit);
  const fetchCats = useServerFn(listCategories);
  const fetchLogs = useServerFn(getProductAuditLogs);
  const save = useServerFn(updateProduct);

  const q = useQuery({ queryKey: ["edit-product", id], queryFn: () => fetchOne({ data: { id } }) });
  const cats = useQuery({ queryKey: ["categories"], queryFn: () => fetchCats() });
  const logsQ = useQuery({
    queryKey: ["product-audit", id],
    queryFn: () => fetchLogs({ data: { id } }),
  });

  const [form, setForm] = useState<{
    title: string;
    description: string;
    price: string;
    currency: string;
    category_id: string;
    condition: string;
    brand: string;
    quantity: string;
    district: string;
    sector: string;
    location_text: string;
    featured: boolean;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const p = q.data?.product;
    if (p && !form) {
      setForm({
        title: p.title ?? "",
        description: p.description ?? "",
        price: String(p.price ?? 0),
        currency: p.currency ?? "RWF",
        category_id: p.category_id ?? "",
        condition: p.condition ?? "",
        brand: p.brand ?? "",
        quantity: String(p.quantity ?? 1),
        district: p.district ?? "",
        sector: p.sector ?? "",
        location_text: p.location_text ?? "",
        featured: !!p.featured,
      });
    }
  }, [q.data, form]);

  const mut = useMutation({
    mutationFn: async () => {
      if (!form) return;
      await save({
        data: {
          id,
          title: form.title,
          description: form.description,
          price: Number(form.price),
          currency: form.currency,
          category_id: form.category_id,
          condition: form.condition || null,
          brand: form.brand || null,
          quantity: Number(form.quantity),
          district: form.district || null,
          sector: form.sector || null,
          location_text: form.location_text || null,
          featured: form.featured,
        },
      });
    },
    onSuccess: () => nav({ to: "/products/manage" }),
    onError: (e: Error) => setErr(e.message),
  });

  if (q.isLoading || !form)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  if (q.isError)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-destructive">
        {(q.error as Error).message}
      </div>
    );

  const f = form;
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setForm({ ...f, [k]: v });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/products/manage"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-3xl font-display gold-text mb-6">Edit product</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          mut.mutate();
        }}
        className="luxury-card rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Field label="Title" className="md:col-span-2">
          <input
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
            required
            maxLength={200}
            className={inputCls}
          />
        </Field>
        <Field label="Description" className="md:col-span-2">
          <textarea
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
            required
            rows={5}
            maxLength={5000}
            className={inputCls}
          />
        </Field>
        <Field label="Price">
          <input
            type="number"
            min={0}
            value={f.price}
            onChange={(e) => set("price", e.target.value)}
            required
            className={inputCls}
          />
        </Field>
        <Field label="Currency">
          <input
            value={f.currency}
            onChange={(e) => set("currency", e.target.value)}
            required
            maxLength={8}
            className={inputCls}
          />
        </Field>
        <Field label="Category">
          <select
            value={f.category_id}
            onChange={(e) => set("category_id", e.target.value)}
            required
            className={inputCls}
          >
            <option value="">—</option>
            {cats.data?.categories.map((c: { id: string; name: string }) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quantity">
          <input
            type="number"
            min={1}
            value={f.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            required
            className={inputCls}
          />
        </Field>
        <Field label="Condition">
          <input
            value={f.condition}
            onChange={(e) => set("condition", e.target.value)}
            maxLength={60}
            className={inputCls}
          />
        </Field>
        <Field label="Brand">
          <input
            value={f.brand}
            onChange={(e) => set("brand", e.target.value)}
            maxLength={120}
            className={inputCls}
          />
        </Field>
        <Field label="District">
          <input
            value={f.district}
            onChange={(e) => set("district", e.target.value)}
            maxLength={120}
            className={inputCls}
          />
        </Field>
        <Field label="Sector">
          <input
            value={f.sector}
            onChange={(e) => set("sector", e.target.value)}
            maxLength={120}
            className={inputCls}
          />
        </Field>
        <Field label="Location text" className="md:col-span-2">
          <input
            value={f.location_text}
            onChange={(e) => set("location_text", e.target.value)}
            maxLength={255}
            className={inputCls}
          />
        </Field>
        <label className="md:col-span-2 inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={f.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Featured listing
        </label>

        {err && <div className="md:col-span-2 text-sm text-destructive">{err}</div>}

        <div className="md:col-span-2 flex gap-3 justify-end">
          <Link
            to="/products/manage"
            className="px-4 py-2.5 rounded-md gold-border text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={mut.isPending}
            className="btn-gold px-5 py-2.5 rounded-md font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-60"
          >
            {mut.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save changes
          </button>
        </div>
      </form>

      <div className="luxury-card rounded-xl p-6 mt-6">
        <h2 className="font-display text-lg mb-3">Activity log</h2>
        {logsQ.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : logsQ.data?.logs.length === 0 ? (
          <div className="text-sm text-muted-foreground">No activity yet.</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {logsQ.data?.logs.map((l) => {
              const prof = (l as unknown as { profiles?: { full_name?: string; email?: string } })
                .profiles;
              const name = prof?.full_name ?? prof?.email ?? "Unknown";
              return (
                <li
                  key={l.id}
                  className="flex justify-between gap-3 border-b border-border pb-2"
                >
                  <span>
                    <span className="text-[var(--gold)] font-mono">{l.action}</span> by {name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-[var(--gold)]";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
