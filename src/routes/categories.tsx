import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCategories } from "@/lib/products.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories — Elimi Trust Ltd" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { t } = useI18n();
  const fetchCats = useServerFn(listCategories);
  const cats = useQuery({ queryKey: ["categories"], queryFn: () => fetchCats() });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-display gold-text mb-8">{t("home.categories")}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {(cats.data?.categories ?? []).map((c: any) => (
          <Link key={c.id} to="/products" search={{ category: c.slug }} className="luxury-card rounded-xl p-6 text-center hover:text-[var(--gold)]">
            <div className="font-display text-lg">{c.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
