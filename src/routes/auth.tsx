import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { bootstrapSuperAdmin } from "@/lib/admin.functions";
import { useI18n } from "@/lib/i18n";
import { Loader2, Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Staff Login — Elimi Trust Ltd" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const bootstrap = useServerFn(bootstrapSuperAdmin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { bootstrap().catch(() => {}); }, [bootstrap]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(t("auth.error")); return; }
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl btn-gold mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-display gold-text">{t("auth.title")}</h1>
          <p className="text-sm text-muted-foreground mt-2">{t("auth.subtitle")}</p>
        </div>
        <form onSubmit={submit} className="luxury-card rounded-2xl p-7 space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest text-muted-foreground mb-2">{t("auth.email")}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--input)] border border-border focus:outline-none focus:border-[var(--gold)] transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-widest text-muted-foreground mb-2">{t("auth.password")}</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--input)] border border-border focus:outline-none focus:border-[var(--gold)] transition" />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full btn-gold py-3.5 rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? t("auth.signing") : t("auth.signin")}
          </button>
        </form>
      </div>
    </div>
  );
}
