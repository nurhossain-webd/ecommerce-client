"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { getStoreImage } from "@/lib/store-images";
import { formatCurrency } from "@/lib/utils/currency";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { loginHref } from "@/lib/auth-redirect";

export default function CartPage() {
  const { user } = useAuth();
  const { items, ready, itemCount, estimatedSubtotal, removeProduct, increaseQuantity, decreaseQuantity, setQuantity, clearCart } = useCart();

  if (!ready) return <div className="space-y-5" role="status" aria-label="Loading cart"><Skeleton className="h-10 w-52" /><Skeleton className="h-48 w-full" /></div>;
  if (user?.role === "ADMIN") return <EmptyState icon="shield" title="Customer cart unavailable" action={<ButtonLink href="/">Back to store</ButtonLink>}>Administrators can browse the storefront, products, and categories without customer purchasing tools.</EmptyState>;

  return <>
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted"><Link href="/" className="hover:text-brand">Home</Link><span>/</span><span aria-current="page" className="text-ink">Cart</span></nav>
    <div className="page-heading"><p className="eyebrow mb-3">Your selection</p><h1>Shopping cart</h1><p>{itemCount} {itemCount === 1 ? "item" : "items"} ready for checkout.</p></div>
    {items.length === 0 ? <EmptyState icon="cart" title="Your cart is empty" action={<ButtonLink href="/products">Shop products</ButtonLink>}>Add a few products and they will appear here.</EmptyState> : <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-label="Cart items" className="space-y-4">
        {items.map(({ product, quantity }) => <article key={product.id} className="card grid gap-4 p-4 sm:grid-cols-[130px_minmax(0,1fr)] sm:p-5">
          <Link href={`/products/${product.id}`} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface sm:aspect-square"><Image src={getStoreImage(`${product.name} ${product.category?.name ?? ""}`)} alt={product.name} fill sizes="(max-width: 640px) 100vw, 130px" className="object-cover" /></Link>
          <div className="flex min-w-0 flex-col"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-medium text-brand">{product.category?.name ?? "Product"}</p><Link href={`/products/${product.id}`} className="mt-1 block truncate text-lg font-semibold text-ink hover:text-brand">{product.name}</Link><p className="mt-1 text-sm text-muted">{formatCurrency(product.price)} each</p></div><strong className="shrink-0 text-lg text-ink">{formatCurrency(product.price * quantity)}</strong></div>
            <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5"><div><span className="mb-2 block text-xs font-semibold text-ink">Quantity</span><div className="flex items-center"><Button variant="secondary" size="icon" className="size-10 min-h-10 rounded-r-none" onClick={() => decreaseQuantity(product.id)} aria-label={`Decrease ${product.name} quantity`}>−</Button><Input type="number" min="1" max={product.stock} value={quantity} onChange={(event) => setQuantity(product.id, Number(event.target.value))} aria-label={`${product.name} quantity`} className="h-10 min-h-10 w-16 rounded-none px-2 text-center" /><Button variant="secondary" size="icon" className="size-10 min-h-10 rounded-l-none" disabled={quantity >= product.stock} onClick={() => increaseQuantity(product.id)} aria-label={`Increase ${product.name} quantity`}>+</Button></div></div><Button variant="ghost" size="sm" className="text-red-700" onClick={() => removeProduct(product.id)}>Remove</Button></div>
          </div>
        </article>)}
        <div className="flex flex-wrap justify-between gap-3"><ButtonLink href="/products" variant="secondary"><Icon name="arrow" className="size-4 rotate-180" />Continue shopping</ButtonLink><Button variant="ghost" onClick={clearCart}>Clear cart</Button></div>
      </section>
      <aside className="card p-5 lg:sticky lg:top-40 sm:p-6"><p className="eyebrow">Order summary</p><h2 className="mt-2 text-xl font-semibold text-ink">Estimated total</h2><div className="mt-6 border-y border-line py-5 text-sm"><div className="flex justify-between gap-4 text-muted"><span>Items ({itemCount})</span><span>{formatCurrency(estimatedSubtotal)}</span></div></div><div className="flex justify-between gap-4 py-5"><span className="font-semibold text-ink">Estimated subtotal</span><strong className="text-xl text-ink">{formatCurrency(estimatedSubtotal)}</strong></div><p className="mb-5 text-xs leading-5 text-muted">Displayed prices are estimates. Current pricing and stock are verified by the server at checkout.</p><ButtonLink href={user ? "/checkout" : loginHref("/checkout")} className="w-full">{user ? "Continue to checkout" : "Log in to checkout"}</ButtonLink></aside>
    </div>}
  </>;
}
