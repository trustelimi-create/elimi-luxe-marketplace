import { Link } from "@tanstack/react-router";
import { cldOptimize } from "@/lib/cloudinary";
import { useI18n } from "@/lib/i18n";
import { Heart, MapPin } from "lucide-react";

export interface ProductCardData {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: "available" | "sold" | "pending" | "reserved";
  district?: string | null;
  featured_image?: string | null;
  likes_count?: number;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  const { t, lang } = useI18n();
  const formatted = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US").format(p.price);

  return (
    <Link to="/products/$id" params={{ id: p.id }} className="block group">
      <div className="luxury-card rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--gold)]/20 active:scale-[0.97] cursor-pointer animate-fade-in">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-elevated)]">
          {p.featured_image ? (
            <img
              src={cldOptimize(p.featured_image, 600)}
              alt={p.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
          )}
          {p.status !== "available" && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] tracking-widest font-semibold uppercase bg-background/80 backdrop-blur text-[var(--gold)] gold-border">
              {t(`product.status.${p.status}`)}
            </div>
          )}
          {typeof p.likes_count === "number" && p.likes_count > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-background/80 backdrop-blur">
              <Heart className="w-3 h-3 fill-[var(--gold)] text-[var(--gold)]" />
              {p.likes_count}
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-[var(--gold)] transition">{p.title}</h3>
          {p.district && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <MapPin className="w-3 h-3" /> {p.district}
            </div>
          )}
          <div className="mt-auto pt-3 text-lg font-display gold-text">
            {p.currency} {formatted}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="luxury-card rounded-xl overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton rounded" />
        <div className="h-3 w-1/2 skeleton rounded" />
        <div className="h-5 w-1/3 skeleton rounded" />
      </div>
    </div>
  );
}
