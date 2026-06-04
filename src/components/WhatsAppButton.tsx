import { useI18n } from "@/lib/i18n";
import { buildWhatsAppLink } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";

export function WhatsAppButton({
  productId,
  productTitle,
  className = "",
}: {
  productId: string;
  productTitle: string;
  className?: string;
}) {
  const { t, lang } = useI18n();
  const url = typeof window !== "undefined" ? window.location.href : "";
  const wa = buildWhatsAppLink(productTitle, productId, url, lang);

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
      href={wa}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handle}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold transition btn-gold ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-1.7-.9-2.9-1.6-4-3.6-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-.9-2.2c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.1 3.3 5.1 4.6 1.9.8 2.6.9 3.5.8.6-.1 1.7-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3M12 22a10 10 0 0 1-5.1-1.4L2 22l1.5-4.7A10 10 0 1 1 12 22"/>
      </svg>
      {t("product.contact.whatsapp")}
    </a>
  );
}
