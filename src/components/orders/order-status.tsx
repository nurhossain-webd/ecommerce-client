import type { OrderStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const tone = status === "DELIVERED" ? "success" : status === "CANCELLED" ? "warning" : status === "PENDING" ? "neutral" : "brand";
  return <Badge tone={tone}>{status.replaceAll("_", " ")}</Badge>;
}

const progress = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") return <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">This order is cancelled.</div>;
  const currentIndex = progress.indexOf(status as (typeof progress)[number]);
  return <ol aria-label={`Order status: ${status}`} className="grid gap-3 sm:grid-cols-4">
    {progress.map((step, index) => {
      const reached = index <= currentIndex;
      const current = index === currentIndex;
      return <li key={step} aria-current={current ? "step" : undefined} className="relative flex items-center gap-3 sm:block"><span className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${reached ? "border-brand bg-brand text-white" : "border-line bg-white text-muted"}`}>{reached ? "✓" : index + 1}</span><div className={`hidden h-0.5 sm:absolute sm:left-7 sm:right-0 sm:top-3.5 sm:block ${index < currentIndex ? "bg-brand" : "bg-line"}`} aria-hidden="true" /><span className={`text-xs font-semibold sm:mt-3 sm:block ${reached ? "text-ink" : "text-muted"}`}>{step[0] + step.slice(1).toLowerCase()}</span></li>;
    })}
  </ol>;
}
