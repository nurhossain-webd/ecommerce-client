"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Product } from "@/lib/types";
import { getStoreImage } from "@/lib/store-images";
import { BuyProductButton } from "@/components/buy-product-button";

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const loadProducts = () => apiRequest<Product[]>("/api/products").then(setProducts).catch((caught) => setError(getErrorMessage(caught))).finally(() => setLoading(false));
  useEffect(() => { loadProducts(); }, []);
  const selectedItems = useMemo(() => Object.entries(quantities).filter(([, quantity]) => quantity > 0).map(([productId, quantity]) => ({ productId, quantity })), [quantities]);

  const createOrder = async () => {
    setError(""); setSuccess("");
    if (!user) return setError("Log in before placing an order.");
    if (!selectedItems.length) return setError("Choose at least one product quantity.");
    setSubmitting(true);
    try {
      await apiRequest("/api/orders", { method: "POST", auth: true, body: { items: selectedItems } });
      setSuccess("Order created successfully."); setQuantities({}); await loadProducts();
    } catch (caught) { setError(getErrorMessage(caught)); }
    finally { setSubmitting(false); }
  };

  return <><div className="page-heading"><h1>Products</h1><p>Live inventory and prices from the backend.</p></div>
    {error && <div className="alert-error mb-4">{error}</div>}
    {success && <div className="alert-success mb-4">{success} <Link className="font-bold underline" href="/orders">View orders</Link></div>}
    {loading ? <div className="state-card">Loading products...</div> : products.length === 0 ? <div className="state-card">No products are available.</div> : <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => {
        const available = product.status === "ACTIVE" && product.stock > 0;
        return <article key={product.id} className="card flex flex-col overflow-hidden">
          <div className="relative h-52"><Image src={getStoreImage(`${product.name} ${product.category?.name ?? ""}`)} alt={product.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" /></div>
          <div className="flex flex-1 flex-col p-5"><div className="flex items-start justify-between gap-3"><div><span className="badge">{product.category?.name ?? "Product"}</span><h2 className="mt-3 text-xl font-bold text-slate-900">{product.name}</h2></div><strong className="text-lg text-indigo-700">${product.price.toFixed(2)}</strong></div>
          <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{product.description || "No description provided."}</p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-5"><div className="text-sm"><div className="font-semibold text-slate-700">{product.stock} in stock</div><div className={available ? "text-emerald-600" : "text-amber-600"}>{product.status}</div></div>
            {user?.role !== "ADMIN" && <div className="field w-24"><label htmlFor={`qty-${product.id}`}>Quantity</label><input id={`qty-${product.id}`} className="input" type="number" min="0" max={product.stock} disabled={!available} value={quantities[product.id] ?? 0} onChange={(event) => setQuantities((current) => ({ ...current, [product.id]: Math.min(product.stock, Math.max(0, Number(event.target.value))) }))} /></div>}
          </div>
          <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4"><Link className="button-secondary" href={`/products/${product.id}`}>View details</Link><BuyProductButton product={product} onPurchased={loadProducts} /></div>
          </div>
        </article>;
      })}</div>
      {user?.role !== "ADMIN" && <div className="card sticky bottom-4 mt-6 flex flex-col items-center justify-between gap-4 p-4 sm:flex-row"><div><strong>{selectedItems.length}</strong> selected product line(s)<p className="text-sm text-slate-500">The backend calculates trusted prices and totals.</p></div>{user ? <button className="button-primary" disabled={submitting || !selectedItems.length} onClick={createOrder}>{submitting ? "Creating order..." : "Place order"}</button> : <Link className="button-primary" href="/login">Login to order</Link>}</div>}
    </>}
  </>;
}
