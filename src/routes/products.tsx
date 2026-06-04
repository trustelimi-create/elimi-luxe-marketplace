import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProducts, listCategories } from "@/lib/products.functions";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { useI18n } from "@/lib/i18n";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "All Products — Elimi Trust Ltd" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { t } = useI18n();
  const sp = Route.useSearch();
  const navigate = Route.useNavigate();
  const fetchProducts = useServerFn(listProducts);
  const fetchCategories = useServerFn(listCategories);

  const [search, setSearch] = useState(sp.q ?? "");
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc">("newest");

  const cats = useQuery({ queryKey: ["categories"], queryFn: () => fetchCategories() });
  const categoryId = useMemo(() => {
    if (!sp.category || !cats.data) return null;
    return cats.data.categories.find((c: any) => c.slug === sp.category)?.id ?? null;
  }, [sp.category, cats.data]);

  const products = useQuery({
    queryKey: ["products", "list", categoryId, search, sort],
    queryFn: () => fetchProducts({ data: { category_id: categoryId ?? null, search: search || undefined, sort, limit: 48, offset: 0 } }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-display gold-text mb-2">{t("products.title")}</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("products.search")}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--input)] border border-border focus:outline-none focus:border-[var(--gold)]"
          />
        </div>
        <select
          value={sp.category ?? ""}
          onChange={(e) => navigate({ search: { ...sp, category: e.target.value || undefined } as any })}
          className="px-4 py-3 rounded-lg bg-[var(--input)] border border-border focus:outline-none focus:border-[var(--gold)]"
        >
          <option value="">{t("products.filter.all")}</option>
          {(cats.data?.categories ?? []).map((c: any) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="px-4 py-3 rounded-lg bg-[var(--input)] border border-border focus:outline-none focus:border-[var(--gold)]"
        >
          <option value="newest">{t("products.sort.newest")}</option>
          <option value="price_asc">{t("products.sort.price_asc")}</option>
          <option value="price_desc">{t("products.sort.price_desc")}</option>
        </select>
      </div>

      {products.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : (products.data?.products.length ?? 0) === 0 ? (
        <div className="luxury-card rounded-xl p-16 text-center text-muted-foreground">{t("products.empty")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.data!.products.map((p: any) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
