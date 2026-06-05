import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  listMyProducts,
  setProductStatus,
  deleteProduct,
} from "@/lib/products-mgmt.functions";
import { Loader2, Pencil, CheckCircle2, RotateCcw, Trash2, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/products/manage")({
  head: () => ({ meta: [{ title: "Manage Products — Elimi Trust" }] }),
  component: ManagePage,
});

function ManagePage() {
  const list = useServerFn(listMyProducts);
  const setStatus = useServerFn(setProductStatus);
  const del = useServerFn(deleteProduct);
  const qc = useQueryClient();

  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [status, setStatus2] = useState<"any" | "available" | "sold" | "reserved" | "pending">(
    "any",
  );
  const [search, setSearch] = useState("");

  const q = useQuery({
    queryKey: ["manage-products", scope, status, search],
    queryFn: () => list({ data: { scope, status, search: search || undefined } }),
  });

  const refetch = () => qc.invalidateQueries({ queryKey: ["manage-products"] });

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "available" | "sold" | "reserved" }) =>
      setStatus({ data: v }),
    onSuccess: refetch,
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: refetch,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs tracking-[0.3em] text-[var(--gold)] mb-2">PRODUCTS</div>
          <h1 className="text-4xl font-display">Manage listings</h1>
        </div>
        <Link to="/products/new" className="btn-gold px-4 py-2.5 rounded-lg font-semibold text-sm">
          + New product
        </Link>
      </div>

      <div className="luxury-card rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-center">
        {q.data?.isSuperAdmin && (
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as "mine" | "all")}
            className="px-3 py-2 rounded-md bg-background border border-border text-sm"
          >
            <option value="mine">My listings</option>
            <option value="all">All listings</option>
          </select>
        )}
        <select
          value={status}
          onChange={(e) => setStatus2(e.target.value as typeof status)}
          className="px-3 py-2 rounded-md bg-background border border-border text-sm"
        >
          <option value="any">Any status</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="reserved">Reserved</option>
          <option value="pending">Pending</option>
        </select>
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title…"
            className="w-full pl-9 pr-3 py-2 rounded-md bg-background border border-border text-sm"
          />
        </div>
      </div>

      {q.isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : q.isError ? (
        <div className="text-destructive text-sm">{(q.error as Error).message}</div>
      ) : (
        <div className="luxury-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)] text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {q.data?.products.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.featured_image ? (
                        <img
                          src={p.featured_image}
                          alt=""
                          className="w-12 h-12 rounded-md object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-accent" />
                      )}
                      <div>
                        <div className="font-medium">{p.title}</div>
                        <div className="text-xs text-muted-foreground">{p.district ?? "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono">
                    {p.currency} {p.price.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        p.status === "available"
                          ? "bg-green-500/15 text-green-400"
                          : p.status === "sold"
                          ? "bg-red-500/15 text-red-400"
                          : p.status === "reserved"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <Link
                        to="/products/$id/edit"
                        params={{ id: p.id }}
                        className="p-2 rounded-md hover:bg-accent"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      {p.status !== "sold" ? (
                        <button
                          onClick={() => statusMut.mutate({ id: p.id, status: "sold" })}
                          disabled={statusMut.isPending}
                          className="p-2 rounded-md hover:bg-accent"
                          title="Mark as sold"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        </button>
                      ) : (
                        <button
                          onClick={() => statusMut.mutate({ id: p.id, status: "available" })}
                          disabled={statusMut.isPending}
                          className="p-2 rounded-md hover:bg-accent"
                          title="Restore to available"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      {q.data?.isSuperAdmin && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${p.title}"? This cannot be undone.`))
                              delMut.mutate(p.id);
                          }}
                          disabled={delMut.isPending}
                          className="p-2 rounded-md hover:bg-destructive/15 text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {q.data?.products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
