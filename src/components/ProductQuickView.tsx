import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { X, ChevronLeft, ChevronRight, MapPin, ArrowRight } from "lucide-react";
import { getProduct } from "@/lib/products.functions";
import { cldOptimize } from "@/lib/cloudinary";
import { useI18n } from "@/lib/i18n";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { BuyViaWhatsApp } from "./BuyViaWhatsApp";

export function ProductQuickView({
  productId,
  open,
  onClose,
}: {
  productId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const fetchProduct = useServerFn(getProduct);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [productId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const q = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct({ data: { id: productId! } }),
    enabled: open && !!productId,
  });

  if (!open || !productId) return null;

  const p: any = q.data?.product;
  const images: any[] = p?.product_images ?? [];
  const sorted = [...images].sort(
    (a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order,
  );
  const formatted = p ? new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US").format(Number(p.price)) : "";

  const prev = () => setActive((i) => (sorted.length ? (i - 1 + sorted.length) % sorted.length : 0));
  const next = () => setActive((i) => (sorted.length ? (i + 1) % sorted.length : 0));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-stretch md:items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full h-full md:h-auto md:max-h-[92vh] md:max-w-6xl md:m-4 md:rounded-2xl bg-[var(--background)] overflow-hidden md:gold-border md:shadow-2xl animate-scale-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur ring-1 ring-border hover:bg-accent grid place-items-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        {q.isLoading || !p ? (
          <div className="flex-1 grid place-items-center p-10">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--gold)] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-y-auto md:overflow-hidden">
            {/* Image side */}
            <div className="relative bg-[var(--surface-elevated)] md:h-full">
              <div className="relative aspect-square md:aspect-auto md:h-full">
                {sorted[active] ? (
                  <img
                    src={cldOptimize(sorted[active].image_url, 1200)}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full skeleton" />
                )}
                {sorted.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur ring-1 ring-border hover:bg-accent grid place-items-center"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={next}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur ring-1 ring-border hover:bg-accent grid place-items-center"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {sorted.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActive(i)}
                          aria-label={`Image ${i + 1}`}
                          className={`h-1.5 rounded-full transition-all ${
                            i === active ? "w-6 bg-[var(--gold)]" : "w-1.5 bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {sorted.length > 1 && (
                <div className="hidden md:flex gap-2 p-3 overflow-x-auto bg-background/40">
                  {sorted.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActive(i)}
                      className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border ${
                        i === active ? "border-[var(--gold)]" : "border-border"
                      }`}
                    >
                      <img src={cldOptimize(img.image_url, 200)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info side */}
            <div className="p-6 md:p-8 md:overflow-y-auto flex flex-col">
              {p.categories && (
                <div className="text-[11px] tracking-[0.2em] text-[var(--gold)] mb-2">
                  {p.categories.name?.toUpperCase()}
                </div>
              )}
              <h2 className="text-2xl md:text-3xl font-display mb-3 pr-8">{p.title}</h2>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <AvailabilityBadge status={p.status} quantity={p.quantity} />
                {p.brand && (
                  <span className="px-2 py-1 rounded-md text-xs ring-1 ring-border text-muted-foreground">
                    {p.brand}
                  </span>
                )}
                {p.condition && (
                  <span className="px-2 py-1 rounded-md text-xs ring-1 ring-border text-muted-foreground">
                    {p.condition}
                  </span>
                )}
              </div>

              <div className="text-3xl md:text-4xl font-display gold-text mb-5">
                {p.currency} {formatted}
              </div>

              {(p.district || p.location_text) && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5">
                  <MapPin className="w-4 h-4" />
                  {p.district ?? p.location_text}
                </div>
              )}

              <div className="luxury-card rounded-xl p-4 mb-5">
                <h3 className="text-xs font-semibold tracking-widest text-muted-foreground mb-2">
                  {t("product.description")}
                </h3>
                <p className="text-foreground/90 text-sm leading-relaxed line-clamp-6 whitespace-pre-line">
                  {p.description}
                </p>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                {p.status === "available" ? (
                  <BuyViaWhatsApp
                    title={p.title}
                    description={p.description}
                    price={p.price}
                    currency={p.currency}
                    productId={p.id}
                    lang={lang}
                  />
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-3 rounded-lg ring-1 ring-border">
                    {t(`product.status.${p.status}`)} — {lang === "fr" ? "indisponible à l'achat" : lang === "rw" ? "ntibishoboka kugura" : "not available for purchase"}
                  </div>
                )}
                <Link
                  to="/products/$id"
                  params={{ id: p.id }}
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg gold-border hover:bg-accent transition text-sm"
                >
                  {lang === "fr" ? "Voir tous les détails" : lang === "rw" ? "Reba ibisobanuro byose" : "View full details"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
