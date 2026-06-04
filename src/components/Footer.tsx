import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-md btn-gold flex items-center justify-center font-display text-lg font-bold">E</div>
              <div>
                <div className="font-display text-lg">Elimi Trust Ltd</div>
                <div className="text-[10px] tracking-[0.2em] text-muted-foreground">PREMIUM MARKETPLACE</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">{t("footer.tagline")}</p>
            <div className="flex items-center gap-3 mt-6">
              <a href={BRAND.instagramUrl} target="_blank" rel="noopener" className="w-9 h-9 rounded-md gold-border flex items-center justify-center hover:bg-accent transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={BRAND.facebookUrl} target="_blank" rel="noopener" className="w-9 h-9 rounded-md gold-border flex items-center justify-center hover:bg-accent transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={BRAND.tiktokUrl} target="_blank" rel="noopener" className="w-9 h-9 rounded-md gold-border flex items-center justify-center hover:bg-accent transition text-xs font-bold">
                TT
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">{t("nav.products")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-[var(--gold)]">{t("nav.products")}</Link></li>
              <li><Link to="/categories" className="hover:text-[var(--gold)]">{t("nav.categories")}</Link></li>
              <li><Link to="/about" className="hover:text-[var(--gold)]">{t("nav.about")}</Link></li>
              <li><Link to="/contact" className="hover:text-[var(--gold)]">{t("nav.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">{t("nav.contact")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{BRAND.phones[0]}</li>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{BRAND.phones[1]}</li>
              <li className="flex items-center gap-2 break-all"><Mail className="w-3.5 h-3.5" />{BRAND.email}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Elimi Trust Ltd. {t("footer.rights")}</div>
          <div>Made with care in Rwanda.</div>
        </div>
      </div>
    </footer>
  );
}
