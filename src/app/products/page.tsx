"use client";
import { ProductStock } from "@/components/products/product-stock";
import { formatCurrency } from "@/lib/utils/currency";
import { isProductPurchasable } from "@/lib/utils/stock";
import { Alert } from "@/components/ui/alert";
import { StateCard } from "@/components/ui/state-card";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CatalogSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { productsApi, ordersApi, getErrorMessage } from "@/lib/api";
import type { Product } from "@/lib/types";
import { getStoreImage } from "@/lib/store-images";
import { BuyProductButton } from "@/components/products/buy-product-button";

function ProductsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const loadProducts = () => productsApi.list().then(setProducts).catch((caught) => setError(getErrorMessage(caught))).finally(() => setLoading(false));
  useEffect(() => { loadProducts(); }, []);
  const selectedItems = useMemo(() => Object.entries(quantities).filter(([, quantity]) => quantity > 0).map(([productId, quantity]) => ({ productId, quantity })), [quantities]);

  const visibleProducts = useMemo(() => {
    const term = query.toLocaleLowerCase();
    return products.filter((product) => `${product.name} ${product.description ?? ""} ${product.category.name}`.toLocaleLowerCase().includes(term));
  }, [products, query]);

  const createOrder = async () => {
    setError(""); setSuccess("");
    if (!user) return setError("Log in before placing an order.");
    if (!selectedItems.length) return setError("Choose at least one product quantity.");
    setSubmitting(true);
    try {
      await ordersApi.create({ items: selectedItems });
      setSuccess("Order created successfully."); setQuantities({}); await loadProducts();
    } catch (caught) { setError(getErrorMessage(caught)); }
    finally { setSubmitting(false); }
  };

  return <><div className="page-heading"><p className="eyebrow mb-3">The ShopStack collection</p><h1>{query ? "Search results" : "Find your everyday favorites"}</h1><p>{query ? <>Showing matches for <strong className="font-medium text-ink">“{query}”</strong> · <Link href="/products" className="text-brand underline underline-offset-4">Clear search</Link></> : "Good finds for every part of your day. Explore the collection."}</p></div>
    {error && <Alert className="mb-4">{error}</Alert>}
    {success && <Alert variant="success" className="mb-4">{success} <Link className="font-bold underline" href="/orders">View orders</Link></Alert>}
    {loading ? <CatalogSkeleton /> : products.length === 0 ? <StateCard>No products are available.</StateCard> : <>
      {query && <p role="status" className="mb-5 text-sm text-muted">{visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"} found</p>}
      {visibleProducts.length === 0 && <EmptyState icon="search" title="No matching finds" action={<ButtonLink href="/products" variant="secondary">View all products</ButtonLink>}>Try another product name or category.</EmptyState>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleProducts.map((product) => {
        const available = isProductPurchasable(product);
        return <article key={product.id} className="product-card">
          <div className="product-image"><Image src={getStoreImage(`${product.name} ${product.category?.name ?? ""}`)} alt={product.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition duration-300 hover:scale-[1.03] motion-reduce:transform-none" /></div>
          <div className="flex flex-1 flex-col p-3 pt-5 sm:p-4"><div className="flex items-start justify-between gap-3"><div><span className="badge">{product.category?.name ?? "Product"}</span><h2 className="product-title mt-3">{product.name}</h2></div><strong className="product-price">{formatCurrency(product.price)}</strong></div>
          <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{product.description || "No description provided."}</p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-5"><div className="text-sm"><ProductStock product={product} /><div className={available ? "text-emerald-600" : "text-amber-600"}>{product.status}</div></div>
            {user?.role !== "ADMIN" && <div className="field w-24"><label htmlFor={`qty-${product.id}`}>Quantity</label><input id={`qty-${product.id}`} className="input" type="number" min="0" max={product.stock} disabled={!available} value={quantities[product.id] ?? 0} onChange={(event) => setQuantities((current) => ({ ...current, [product.id]: Math.min(product.stock, Math.max(0, Number(event.target.value))) }))} /></div>}
          </div>
          <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4"><Link className="button-secondary" href={`/products/${product.id}`}>View details</Link><BuyProductButton product={product} onPurchased={loadProducts} /></div>
          </div>
        </article>;
      })}</div>
      {user?.role !== "ADMIN" && <div className="card sticky bottom-4 mt-6 flex flex-col items-center justify-between gap-4 p-4 sm:flex-row"><div><strong>{selectedItems.length}</strong> selected product line(s)<p className="text-sm text-slate-500">Choose quantities, then place your order.</p></div>{user ? <button className="button-primary" disabled={submitting || !selectedItems.length} onClick={createOrder}>{submitting ? "Creating order..." : "Place order"}</button> : <Link className="button-primary" href="/login">Login to order</Link>}</div>}
    </>}
  </>;
}

export default function ProductsPage() {
  return <Suspense fallback={<CatalogSkeleton />}><ProductsContent /></Suspense>;
}
