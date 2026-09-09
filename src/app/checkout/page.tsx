"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { ordersApi, getDetailedErrorMessage as getErrorMessage } from "@/lib/api";
import { getStoreImage } from "@/lib/store-images";
import { formatCurrency } from "@/lib/utils/currency";
import { ProtectedPage } from "@/components/auth/protected-page";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";

function CheckoutContent() {
  const { user } = useAuth();
  const { items, ready, itemCount, estimatedSubtotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const submissionInFlight = useRef(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  const placeOrder = async () => {
    if (submissionInFlight.current || items.length === 0 || user?.role !== "USER") return;
    submissionInFlight.current = true;
    setSubmitting(true);
    setError("");
    try {
      const order = await ordersApi.create({
        items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      });
      setOrderId(order.id);
      clearCart();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      submissionInFlight.current = false;
      setSubmitting(false);
    }
  };

  if (!ready) return <div className="space-y-5" role="status" aria-label="Loading checkout"><Skeleton className="h-10 w-52" /><Skeleton className="h-64 w-full" /></div>;

  if (orderId) return <div className="mx-auto max-w-2xl py-8 text-center sm:py-14"><div className="card px-6 py-10 sm:px-10 sm:py-14"><span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icon name="check" className="size-8" /></span><p className="eyebrow mt-6">Order received</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Your order was placed successfully.</h1><p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted">The server confirmed your order and calculated the final total. You can follow its status in your order history.</p><p className="mt-5 text-xs text-muted">Order #{orderId.slice(0, 8).toUpperCase()}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><ButtonLink href={`/orders/${orderId}`}>View order</ButtonLink><ButtonLink href="/products" variant="secondary">Continue shopping</ButtonLink></div></div></div>;

  if (items.length === 0) return <EmptyState icon="cart" title="Nothing to checkout" action={<ButtonLink href="/products">Continue shopping</ButtonLink>}>Your cart is empty. Add products before starting checkout.</EmptyState>;

  return <>
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted"><Link href="/cart" className="hover:text-brand">Cart</Link><span>/</span><span aria-current="page" className="text-ink">Checkout</span></nav>
    <div className="page-heading"><p className="eyebrow mb-3">Review your order</p><h1>Checkout</h1><p>Confirm the products and quantities below before placing your order.</p></div>
    {error && <Alert className="mb-6">{error}</Alert>}
    {user?.role !== "USER" ? <Alert>Checkout is available to customer accounts.</Alert> : <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-label="Checkout items" className="card divide-y divide-line overflow-hidden">
        {items.map(({ product, quantity }) => <article key={product.id} className="flex gap-4 p-4 sm:p-5"><div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface sm:size-24"><Image src={getStoreImage(`${product.name} ${product.category?.name ?? ""}`)} alt={product.name} fill sizes="96px" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-brand">{product.category?.name ?? "Product"}</p><h2 className="mt-1 truncate font-semibold text-ink">{product.name}</h2><p className="mt-2 text-sm text-muted">{quantity} × {formatCurrency(product.price)}</p></div><strong className="shrink-0 text-sm text-ink sm:text-base">{formatCurrency(product.price * quantity)}</strong></article>)}
      </section>
      <aside className="card p-5 lg:sticky lg:top-40 sm:p-6"><p className="eyebrow">Order summary</p><div className="mt-5 space-y-4 border-y border-line py-5 text-sm"><div className="flex justify-between text-muted"><span>Items ({itemCount})</span><span>{formatCurrency(estimatedSubtotal)}</span></div></div><div className="flex justify-between gap-4 py-5"><span className="font-semibold text-ink">Estimated total</span><strong className="text-xl text-ink">{formatCurrency(estimatedSubtotal)}</strong></div><p className="mb-5 text-xs leading-5 text-muted">This is an estimate. The backend uses current product prices and validates stock when the order is created.</p><Button className="w-full" disabled={submitting} onClick={placeOrder}>{submitting ? "Placing order..." : "Place order"}</Button><ButtonLink href="/cart" variant="ghost" className="mt-2 w-full">Return to cart</ButtonLink></aside>
    </div>}
  </>;
}

export default function CheckoutPage() {
  return <ProtectedPage><CheckoutContent /></ProtectedPage>;
}
