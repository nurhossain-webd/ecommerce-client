import type { OrderItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";

export function OrderItems({ items, compact = false }: { items: OrderItem[]; compact?: boolean }) {
  return <div className={`mt-4 grid ${compact ? "gap-2" : "gap-3"}`}>
    {items.map((item) => compact ? (
      <div key={item.id} className="flex justify-between gap-4 rounded-lg bg-slate-50 p-3 text-sm">
        <span><strong>{item.product.name}</strong> x {item.quantity}</span>
        <strong>{formatCurrency(item.price * item.quantity)}</strong>
      </div>
    ) : (
      <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3">
        <div><strong>{item.product.name}</strong><p className="text-sm text-slate-500">{formatCurrency(item.price)} x {item.quantity}</p></div>
        <strong>{formatCurrency(item.price * item.quantity)}</strong>
      </div>
    ))}
  </div>;
}
