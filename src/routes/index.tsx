import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProducts, listCategories } from "@/lib/products.functions";
import { useI18n } from "@/lib/i18n";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elimi Trust Ltd — Premium Classified Marketplace Rwanda" },
      { name: "description", content: "Buy and sell real estate, vehicles, electronics, fashion and more on Rwanda's premium trusted marketplace." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  const fetchProducts = useServerFn(listProducts);
  const fetchCategories = useServerFn(listCategories);

  const recent = useQuery({
    queryKey: ["products", "recent"],
    queryFn: () => fetchProducts({ data: { sort: "newest", limit: 8, offset: 0 } }),
  });
  const cats = useQuery({ queryKey: ["categories"], queryFn: () => fetchCategories() });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 15% 25%, oklch(0.78 0.13 82 / 0.18), transparent 55%), radial-gradient(circle at 85% 75%, oklch(0.78 0.13 82 / 0.12), transparent 55%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
              ELIMI TRUST LTD • RWANDA
            </div>
            <h1 className="text-5xl md:text-7xl font-display leading-[1.05]">
              <span className="text-foreground">Premium</span>{" "}
              <span className="gold-text">Marketplace</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">{t("home.hero.subtitle")}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/products" className="btn-gold px-7 py-3.5 rounded-lg font-semibold inline-flex items-center gap-2">
                {t("home.hero.cta")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="px-7 py-3.5 rounded-lg gold-border font-semibold hover:bg-accent transition">
                {t("home.hero.contact")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-3xl font-display">{t("home.categories")}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(cats.data?.categories ?? []).slice(0, 12).map((c: any) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className="luxury-card rounded-lg p-4 text-center hover:text-[var(--gold)]"
            >
              <div className="text-sm font-medium">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-3xl font-display">{t("home.recent")}</h2>
          <Link to="/products" className="text-sm text-[var(--gold)] hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recent.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (recent.data?.products?.length ?? 0) === 0 ? (
          <div className="luxury-card rounded-xl p-12 text-center text-muted-foreground">{t("home.empty")}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recent.data!.products.map((p: any) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
