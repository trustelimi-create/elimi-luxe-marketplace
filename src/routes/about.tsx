import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About Elimi Trust Ltd — Premium Marketplace Rwanda" },
    { name: "description", content: "Elimi Trust Ltd is Rwanda's trusted multi-category marketplace for real estate, vehicles, electronics and more." },
  ]}),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-xs tracking-[0.3em] text-[var(--gold)] mb-3">ABOUT US</div>
      <h1 className="text-5xl font-display gold-text mb-8">{t("about.title")}</h1>
      <div className="luxury-card rounded-2xl p-8 md:p-12 space-y-6">
        <div>
          <h2 className="text-xl font-display mb-3">{t("about.mission")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("about.mission.body")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
          <div>
            <div className="text-xs tracking-widest text-muted-foreground mb-2">PHONE</div>
            <div className="text-foreground">{BRAND.phones.join(" / ")}</div>
          </div>
          <div>
            <div className="text-xs tracking-widest text-muted-foreground mb-2">EMAIL</div>
            <div className="text-foreground break-all">{BRAND.email}</div>
          </div>
          <div>
            <div className="text-xs tracking-widest text-muted-foreground mb-2">INSTAGRAM</div>
            <div className="text-foreground">@{BRAND.instagram}</div>
          </div>
          <div>
            <div className="text-xs tracking-widest text-muted-foreground mb-2">TIKTOK / FACEBOOK</div>
            <div className="text-foreground">{BRAND.tiktok} • {BRAND.facebook}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
