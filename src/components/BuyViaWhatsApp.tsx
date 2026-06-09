import { supabase } from "@/integrations/supabase/client";

const BUY_PHONE = "250785407992"; // +250 785 407 992

export function BuyViaWhatsApp({
  title,
  description,
  price,
  currency,
  productId,
  lang,
}: {
  title: string;
  description: string;
  price: number | string;
  currency: string;
  productId: string;
  lang: "en" | "fr" | "rw";
}) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const formattedPrice = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US").format(Number(price));
  const shortDesc = (description ?? "").trim().slice(0, 400);

  const label =
    lang === "fr" ? "Acheter via WhatsApp" : lang === "rw" ? "Gura kuri WhatsApp" : "Buy via WhatsApp";

  const intro =
    lang === "fr"
      ? "Bonjour Elimi Trust, je souhaite acheter ce produit :"
      : lang === "rw"
      ? "Muraho Elimi Trust, ndashaka kugura iki gicuruzwa:"
      : "Hello Elimi Trust, I would like to buy this product:";

  const labels = lang === "fr"
    ? { product: "Produit", price: "Prix", details: "Détails", link: "Lien", confirm: "Veuillez confirmer la disponibilité et les prochaines étapes. Merci." }
    : lang === "rw"
    ? { product: "Igicuruzwa", price: "Igiciro", details: "Ibisobanuro", link: "Link", confirm: "Nyamuneka mwemeze ko gihari hamwe n'ibikurikira. Murakoze." }
    : { product: "Product", price: "Price", details: "Details", link: "Link", confirm: "Please confirm availability and next steps. Thank you." };

  const message =
    `${intro}\n\n` +
    `• ${labels.product}: ${title}\n` +
    `• ${labels.price}: ${currency} ${formattedPrice}\n` +
    `• ${labels.details}: ${shortDesc}\n` +
    `• ${labels.link}: ${url}\n\n` +
    `${labels.confirm}`;

  const href = `https://wa.me/${BUY_PHONE}?text=${encodeURIComponent(message)}`;

  const handle = () => {
    const sessionId = typeof window !== "undefined"
      ? (localStorage.getItem("elimi_session") ?? (() => {
          const s = crypto.randomUUID();
          localStorage.setItem("elimi_session", s);
          return s;
        })())
      : null;
    supabase.from("whatsapp_clicks").insert({ product_id: productId, session_id: sessionId }).then(() => {});
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handle}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white shadow-lg shadow-emerald-900/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
      style={{ background: "linear-gradient(135deg,#25D366 0%,#128C7E 100%)" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-1.7-.9-2.9-1.6-4-3.6-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-.9-2.2c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.1 3.3 5.1 4.6 1.9.8 2.6.9 3.5.8.6-.1 1.7-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3M12 22a10 10 0 0 1-5.1-1.4L2 22l1.5-4.7A10 10 0 1 1 12 22"/>
      </svg>
      {label}
    </a>
  );
}
