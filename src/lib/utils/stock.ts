import type { ProductRecord } from "../../types";

export const LOW_STOCK_THRESHOLD = 5;
export type ProductStockState = "unavailable" | "out-of-stock" | "low-stock" | "in-stock";
type StockProduct = Pick<ProductRecord, "stock" | "status" | "isDeleted">;

/** Mirrors order eligibility: category status is not checked by the order service. */
export function getProductStockState(product: StockProduct, lowStockThreshold = LOW_STOCK_THRESHOLD): ProductStockState {
  if (product.isDeleted || product.status === "INACTIVE") return "unavailable";
  if (product.status === "OUT_OF_STOCK" || !Number.isFinite(product.stock) || product.stock <= 0) return "out-of-stock";
  return product.stock <= lowStockThreshold ? "low-stock" : "in-stock";
}

export function isProductPurchasable(product: StockProduct): boolean {
  const state = getProductStockState(product);
  return state === "in-stock" || state === "low-stock";
}

export function getProductStockLabel(product: StockProduct): string {
  switch (getProductStockState(product)) {
    case "unavailable": return "Unavailable";
    case "out-of-stock": return "Out of stock";
    case "low-stock": return `Only ${product.stock} left`;
    case "in-stock": return `${product.stock} in stock`;
  }
}
