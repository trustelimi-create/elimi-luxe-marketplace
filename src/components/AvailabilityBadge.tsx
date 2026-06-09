import { useI18n } from "@/lib/i18n";
import { CheckCircle2, Clock, XCircle, BookmarkCheck } from "lucide-react";

type Status = "available" | "sold" | "pending" | "reserved";

const styles: Record<Status, { bg: string; text: string; ring: string; Icon: typeof CheckCircle2 }> = {
  available: { bg: "bg-emerald-500/15", text: "text-emerald-400", ring: "ring-emerald-500/30", Icon: CheckCircle2 },
  pending:   { bg: "bg-amber-500/15",   text: "text-amber-400",   ring: "ring-amber-500/30",   Icon: Clock },
  reserved:  { bg: "bg-sky-500/15",     text: "text-sky-400",     ring: "ring-sky-500/30",     Icon: BookmarkCheck },
  sold:      { bg: "bg-rose-500/15",    text: "text-rose-400",    ring: "ring-rose-500/30",    Icon: XCircle },
};

export function AvailabilityBadge({
  status,
  quantity,
  size = "md",
  className = "",
}: {
  status: Status;
  quantity?: number | null;
  size?: "sm" | "md";
  className?: string;
}) {
  const { t } = useI18n();
  const s = styles[status];
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  const showQty = status === "available" && typeof quantity === "number" && quantity > 0;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md ring-1 font-semibold tracking-wide ${padding} ${s.bg} ${s.text} ${s.ring} ${className}`}
    >
      <s.Icon className={iconSize} />
      <span className="uppercase">{t(`product.status.${status}`)}</span>
      {showQty && <span className="opacity-80 normal-case">· {quantity} in stock</span>}
    </span>
  );
}
