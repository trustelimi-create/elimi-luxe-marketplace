import { useI18n, type Lang } from "@/lib/i18n";
import { useState } from "react";

const OPTIONS: { code: Lang; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English", native: "English", flag: "EN" },
  { code: "fr", label: "French", native: "Français", flag: "FR" },
  { code: "rw", label: "Kinyarwanda", native: "Ikinyarwanda", flag: "RW" },
];

export function LanguageGate() {
  const { setLang, t, hasChosen } = useI18n();
  const [picked, setPicked] = useState<Lang | null>(null);

  if (hasChosen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl px-4">
      <div className="absolute inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, oklch(0.78 0.13 82 / 0.15), transparent 50%), radial-gradient(circle at 80% 70%, oklch(0.78 0.13 82 / 0.10), transparent 50%)",
        }}
      />
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-block mb-6">
            <div className="text-xs tracking-[0.3em] text-muted-foreground mb-2">ELIMI TRUST LTD</div>
            <div className="h-px w-32 mx-auto gold-border" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display gold-text mb-3">{t("lang.select")}</h1>
          <p className="text-muted-foreground">{t("lang.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => setPicked(opt.code)}
              className={`luxury-card rounded-xl p-6 text-left transition ${
                picked === opt.code ? "border-[var(--gold)] ring-1 ring-[var(--gold)]" : ""
              }`}
            >
              <div className="text-xs tracking-widest text-muted-foreground mb-3">{opt.flag}</div>
              <div className="text-xl font-display text-foreground">{opt.native}</div>
              <div className="text-sm text-muted-foreground mt-1">{opt.label}</div>
            </button>
          ))}
        </div>

        <button
          disabled={!picked}
          onClick={() => picked && setLang(picked)}
          className="btn-gold w-full py-3.5 rounded-lg font-semibold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("lang.continue")} →
        </button>
      </div>
    </div>
  );
}
