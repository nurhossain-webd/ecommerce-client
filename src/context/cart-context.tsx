"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { isProductPurchasable } from "@/lib/utils/stock";
import { useToast } from "@/context/toast-context";

const CART_STORAGE_KEY = "shopstack_cart";

export type CartItem = { product: Product; quantity: number };
type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  itemCount: number;
  estimatedSubtotal: number;
  addProduct: (product: Product, quantity?: number) => void;
  removeProduct: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function isStoredItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  const product = item.product as Partial<Product> | undefined;
  return Boolean(
    product && typeof product.id === "string" && typeof product.name === "string" &&
    typeof product.price === "number" && typeof product.stock === "number" &&
    Number.isInteger(item.quantity) && Number(item.quantity) > 0,
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(CART_STORAGE_KEY);
        const parsed: unknown = stored ? JSON.parse(stored) : [];
        if (Array.isArray(parsed)) {
          setItems(parsed.filter(isStoredItem).map((item) => ({
            product: item.product,
            quantity: Math.min(item.quantity, Math.max(0, item.product.stock)),
          })).filter((item) => item.quantity > 0));
        }
      } catch {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Keep the in-memory cart usable when browser storage is unavailable.
    }
  }, [items, ready]);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) => current.flatMap((item) => {
      if (item.product.id !== productId) return [item];
      const nextQuantity = Math.min(item.product.stock, Math.max(0, Math.floor(quantity) || 0));
      return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
    }));
  }, []);

  const addProduct = useCallback((product: Product, quantity = 1) => {
    if (!isProductPurchasable(product)) return;
    const amount = Math.min(product.stock, Math.max(1, Math.floor(quantity) || 1));
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (!existing) return [...current, { product, quantity: amount }];
      return current.map((item) => item.product.id === product.id
        ? { product, quantity: Math.min(product.stock, item.quantity + amount) }
        : item);
    });
    toast(`${product.name} added to your cart.`);
  }, [toast]);

  const removeProduct = useCallback((productId: string) => setItems((current) => current.filter((item) => item.product.id !== productId)), []);
  const increaseQuantity = useCallback((productId: string) => setItems((current) => current.map((item) => item.product.id === productId ? { ...item, quantity: Math.min(item.product.stock, item.quantity + 1) } : item)), []);
  const decreaseQuantity = useCallback((productId: string) => setItems((current) => current.flatMap((item) => item.product.id !== productId ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [])), []);
  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => ({
    items,
    ready,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    estimatedSubtotal: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    addProduct,
    removeProduct,
    increaseQuantity,
    decreaseQuantity,
    setQuantity,
    clearCart,
  }), [addProduct, clearCart, decreaseQuantity, increaseQuantity, items, ready, removeProduct, setQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
