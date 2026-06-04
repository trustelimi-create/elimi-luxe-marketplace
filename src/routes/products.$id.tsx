import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProduct } from "@/lib/products.functions";
import { cldOptimize } from "@/lib/cloudinary";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { Heart, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const fetchProduct = useServerFn(getProduct);
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState(false);

  const q = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct({ data: { id } }),
  });

  if (q.isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-20"><div className="aspect-video skeleton rounded-2xl" /></div>;
  }
  if (!q.data?.product) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">Product not found.</div>;
  }
  const p: any = q.data.product;
  const images: any[] = p.product_images ?? [];
  const sorted = [...images].sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order);
  const formatted = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US").format(Number(p.price));

  const toggleLike = async () => {
    const sid = localStorage.getItem("elimi_session") ?? (() => { const s = crypto.randomUUID(); localStorage.setItem("elimi_session", s); return s; })();
    if (liked) {
      await supabase.from("product_likes").delete().eq("product_id", p.id).eq("session_id", sid);
      setLiked(false);
    } else {
      await supabase.from("product_likes").insert({ product_id: p.id, session_id: sid });
      setLiked(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden luxury-card mb-3">
            {sorted[active] ? (
              <img src={cldOptimize(sorted[active].image_url, 1000)} alt={p.title} className="w-full h-full object-cover" />
            ) : <div className="w-full h-full skeleton" />}
          </div>
          {sorted.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {sorted.map((img, i) => (
                <button key={img.id} onClick={() => setActive(i)}
                  className={`aspect-square rounded-md overflow-hidden border ${i === active ? "border-[var(--gold)]" : "border-border"}`}>
                  <img src={cldOptimize(img.image_url, 200)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {p.categories && <div className="text-xs tracking-widest text-[var(--gold)] mb-2">{p.categories.name?.toUpperCase()}</div>}
          <h1 className="text-3xl md:text-4xl font-display mb-3">{p.title}</h1>
          <div className="text-3xl font-display gold-text mb-6">{p.currency} {formatted}</div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            {p.brand && <div><span className="text-foreground">{t("product.brand")}:</span> {p.brand}</div>}
            {p.condition && <div><span className="text-foreground">{t("product.condition")}:</span> {p.condition}</div>}
            {(p.district || p.location_text) && (
              <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{p.district ?? p.location_text}</div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <WhatsAppButton productId={p.id} productTitle={p.title} />
            <button onClick={toggleLike}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg gold-border hover:bg-accent transition ${liked ? "text-[var(--gold)]" : ""}`}>
              <Heart className={`w-4 h-4 ${liked ? "fill-[var(--gold)]" : ""}`} /> {t("product.like")}
            </button>
          </div>

          <div className="luxury-card rounded-xl p-6">
            <h3 className="text-sm font-semibold tracking-widest text-muted-foreground mb-3">{t("product.description")}</h3>
            <p className="text-foreground whitespace-pre-line leading-relaxed">{p.description}</p>
          </div>

          {p.extra_fields && Object.keys(p.extra_fields).length > 0 && (
            <div className="luxury-card rounded-xl p-6 mt-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(p.extra_fields).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
                    <span className="text-foreground">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
