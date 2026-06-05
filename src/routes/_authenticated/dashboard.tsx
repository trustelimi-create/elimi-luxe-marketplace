import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { dashboardStats } from "@/lib/products.functions";
import { getMyRoles } from "@/lib/me.functions";
import { useI18n } from "@/lib/i18n";
import {
  Package,
  CheckCircle2,
  Clock,
  Bookmark,
  FileText,
  MessageCircle,
  Plus,
  ListChecks,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Elimi Trust Ltd" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  const fetchStats = useServerFn(dashboardStats);
  const fetchRoles = useServerFn(getMyRoles);
  const { user } = Route.useRouteContext();
  const q = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => fetchStats() });
  const me = useQuery({ queryKey: ["my-roles"], queryFn: () => fetchRoles() });
  const isSuperAdmin = me.data?.roles.includes("super_admin");
  const totals = q.data?.totals;

  const cards = [
    { label: "Total Products", value: totals?.products, icon: Package },
    { label: t("product.status.available"), value: totals?.available, icon: CheckCircle2 },
    { label: t("product.status.sold"), value: totals?.sold, icon: Bookmark },
    { label: t("product.status.pending"), value: totals?.pending, icon: Clock },
    { label: "Reports", value: totals?.reports, icon: FileText },
    { label: "WhatsApp Clicks", value: totals?.whatsapp_clicks, icon: MessageCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs tracking-[0.3em] text-[var(--gold)] mb-2">DASHBOARD</div>
          <h1 className="text-4xl font-display">
            {t("dashboard.welcome")}, <span className="gold-text">{user.email}</span>
          </h1>
        </div>
        <Link
          to="/products/new"
          className="btn-gold px-5 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {t("dashboard.new_product")}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="luxury-card rounded-xl p-5">
            <c.icon className="w-5 h-5 text-[var(--gold)] mb-3" />
            <div className="text-3xl font-display">{c.value ?? "—"}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/products/new" className="luxury-card rounded-xl p-6 hover:text-[var(--gold)]">
          <Plus className="w-5 h-5 text-[var(--gold)] mb-2" />
          <div className="font-display text-lg mb-1">{t("dashboard.new_product")}</div>
          <div className="text-sm text-muted-foreground">Upload a new listing with images.</div>
        </Link>
        <Link to="/products/manage" className="luxury-card rounded-xl p-6 hover:text-[var(--gold)]">
          <ListChecks className="w-5 h-5 text-[var(--gold)] mb-2" />
          <div className="font-display text-lg mb-1">Manage listings</div>
          <div className="text-sm text-muted-foreground">
            Edit, mark as sold, restore, or delete products.
          </div>
        </Link>
        {isSuperAdmin && (
          <Link to="/employees" className="luxury-card rounded-xl p-6 hover:text-[var(--gold)]">
            <Users className="w-5 h-5 text-[var(--gold)] mb-2" />
            <div className="font-display text-lg mb-1">Employees</div>
            <div className="text-sm text-muted-foreground">
              Create staff, reset passwords, suspend accounts.
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
