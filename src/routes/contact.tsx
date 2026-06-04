import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { Phone, Mail, MessageCircle, Instagram, Facebook } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Elimi Trust Ltd" }] }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-5xl font-display gold-text mb-3">{t("contact.title")}</h1>
      <p className="text-muted-foreground mb-10">{t("contact.subtitle")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href={`tel:${BRAND.phones[0]}`} className="luxury-card rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg btn-gold flex items-center justify-center"><Phone className="w-5 h-5" /></div>
          <div><div className="text-xs tracking-widest text-muted-foreground">{t("contact.phone")}</div><div>{BRAND.phones.join(" / ")}</div></div>
        </a>
        <a href={`https://wa.me/${BRAND.whatsapp[0]}`} target="_blank" rel="noopener" className="luxury-card rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg btn-gold flex items-center justify-center"><MessageCircle className="w-5 h-5" /></div>
          <div><div className="text-xs tracking-widest text-muted-foreground">{t("contact.whatsapp")}</div><div>{BRAND.phones.join(" / ")}</div></div>
        </a>
        <a href={`mailto:${BRAND.email}`} className="luxury-card rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg btn-gold flex items-center justify-center"><Mail className="w-5 h-5" /></div>
          <div><div className="text-xs tracking-widest text-muted-foreground">{t("contact.email")}</div><div className="break-all">{BRAND.email}</div></div>
        </a>
        <div className="luxury-card rounded-xl p-6">
          <div className="text-xs tracking-widest text-muted-foreground mb-3">{t("contact.social")}</div>
          <div className="flex gap-3">
            <a href={BRAND.instagramUrl} target="_blank" rel="noopener" className="w-10 h-10 rounded-md gold-border flex items-center justify-center"><Instagram className="w-4 h-4" /></a>
            <a href={BRAND.facebookUrl} target="_blank" rel="noopener" className="w-10 h-10 rounded-md gold-border flex items-center justify-center"><Facebook className="w-4 h-4" /></a>
            <a href={BRAND.tiktokUrl} target="_blank" rel="noopener" className="w-10 h-10 rounded-md gold-border flex items-center justify-center text-xs font-bold">TT</a>
          </div>
        </div>
      </div>
    </div>
  );
}
