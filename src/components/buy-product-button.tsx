"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Product } from "@/lib/types";

type Props = {
  product: Product;
  onPurchased?: () => void | Promise<void>;
};

export function BuyProductButton({ product, onPurchased }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const available = product.status === "ACTIVE" && product.stock > 0;

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, submitting]);

  if (user?.role === "ADMIN") return null;

  const close = () => {
    if (submitting) return;
    setOpen(false);
    setError("");
    setComplete(false);
    setQuantity(1);
  };

  const confirmPurchase = async () => {
    if (!user) {
      setError("Please log in before confirming your purchase.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await apiRequest("/api/orders", {
        method: "POST",
        auth: true,
        body: { items: [{ productId: product.id, quantity }] },
      });
      setComplete(true);
      await onPurchased?.();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button className="button-primary" disabled={!available} onClick={() => setOpen(true)}>
        {available ? "Buy now" : "Unavailable"}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <section className="card w-full max-w-md p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="buy-title">
            {complete ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-700">OK</div>
                <h2 id="buy-title" className="mt-4 text-2xl font-black text-slate-900">Order confirmed</h2>
                <p className="mt-2 text-sm text-slate-600">Your order for {product.name} was created successfully.</p>
                <div className="mt-6 flex justify-center gap-3"><button className="button-secondary" onClick={close}>Continue shopping</button><Link className="button-primary" href="/orders">View order</Link></div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-indigo-600">Confirm purchase</p><h2 id="buy-title" className="mt-1 text-2xl font-black text-slate-900">{product.name}</h2></div><button className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={close} aria-label="Close purchase dialog">X</button></div>
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Database price</span><strong className="text-slate-900">${product.price.toFixed(2)}</strong></div>
                  <div className="mt-3 field"><label htmlFor={`buy-quantity-${product.id}`}>Quantity</label><input id={`buy-quantity-${product.id}`} className="input" type="number" min="1" max={product.stock} value={quantity} onChange={(event) => setQuantity(Math.min(product.stock, Math.max(1, Number(event.target.value) || 1)))} /></div>
                  <div className="mt-3 flex justify-between border-t border-slate-200 pt-3"><span className="font-semibold text-slate-600">Estimated total</span><strong className="text-lg text-indigo-700">${(product.price * quantity).toFixed(2)}</strong></div>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">The backend verifies the current price and stock before creating your order.</p>
                {error && <div className="alert-error mt-4">{error} {!user && <Link className="ml-1 font-bold underline" href="/login">Login</Link>}</div>}
                <div className="mt-6 flex justify-end gap-3"><button className="button-secondary" disabled={submitting} onClick={close}>Cancel</button><button className="button-primary" disabled={submitting} onClick={confirmPurchase}>{submitting ? "Confirming..." : "Confirm order"}</button></div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
