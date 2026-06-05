import { Link, useNavigate } from "@tanstack/react-router";
import { useI18n, type Lang } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, Globe, LogOut, LayoutDashboard } from "lucide-react";
import { InstallPWAButton } from "@/components/InstallPWAButton";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/products", label: t("nav.products") },
    { to: "/categories", label: t("nav.categories") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled ? "glass shadow-[0_4px_24px_-12px_oklch(0_0_0/0.8)]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-md btn-gold flex items-center justify-center font-display text-lg font-bold">
              E
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg text-foreground">Elimi Trust</div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground">LTD</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition rounded-md"
                activeProps={{ className: "text-[var(--gold)]" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <InstallPWAButton className="hidden md:inline-flex" />
            <LangSwitcher lang={lang} setLang={setLang} />
            {userId ? (
              <>
                <Link to="/dashboard" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-md gold-border hover:bg-accent transition">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden md:inline">{t("nav.dashboard")}</span>
                </Link>
                <button onClick={handleLogout} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link to="/auth" className="hidden sm:inline-flex items-center px-4 py-2 text-sm rounded-md gold-border hover:bg-accent transition">
                {t("nav.login")}
              </Link>
            )}
            <button onClick={() => setOpen((v) => !v)} className="lg:hidden p-2 text-foreground">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border glass">
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition"
              >
                {l.label}
              </Link>
            ))}
            <div className="h-px bg-border my-1" />
            {userId ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-md text-sm text-[var(--gold)]">
                  {t("nav.dashboard")}
                </Link>
                <button onClick={handleLogout} className="text-left px-3 py-2.5 rounded-md text-sm text-muted-foreground">
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-md text-sm text-[var(--gold)]">
                {t("nav.login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const labels: Record<Lang, string> = { en: "EN", fr: "FR", rw: "RW" };
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md hover:bg-accent transition text-muted-foreground hover:text-foreground"
      >
        <Globe className="w-4 h-4" />
        <span className="font-mono text-xs">{labels[lang]}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-32 glass rounded-md shadow-lg overflow-hidden">
          {(["en", "fr", "rw"] as Lang[]).map((l) => (
            <button
              key={l}
              onMouseDown={() => { setLang(l); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition ${
                l === lang ? "text-[var(--gold)]" : "text-muted-foreground"
              }`}
            >
              {labels[l]}{" "} <span className="text-xs text-muted-foreground">
                {l === "en" ? "English" : l === "fr" ? "Français" : "Kinyarwanda"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
