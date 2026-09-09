import type { ProductRecord } from "@/lib/types";
import { getProductStockLabel, getProductStockState } from "@/lib/utils/stock";
import { cn } from "@/lib/utils/cn";

export function ProductStock({ product }: { product: ProductRecord }) {
  const state = getProductStockState(product);
  return <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", state === "in-stock" ? "text-emerald-800" : state === "low-stock" ? "text-amber-800" : "text-muted")}><span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />{getProductStockLabel(product)}</span>;
}
