"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { getStoreImage } from "@/lib/store-images";
import { BuyProductButton } from "@/components/buy-product-button";

export default function CategoryProductsPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiRequest<Category>(`/api/categories/${id}`),
      apiRequest<Product[]>("/api/products"),
    ])
      .then(([categoryData, productData]) => {
        setCategory(categoryData);
        setProducts(productData.filter((product) => product.categoryId === id));
      })
      .catch((caught) => setError(getErrorMessage(caught)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="state-card">Loading category products...</div>;
  if (error) return <><div className="alert-error">{error}</div><Link className="button-secondary mt-4" href="/categories">Back to categories</Link></>;
  if (!category) return <div className="state-card">Category not found.</div>;

  return (
    <>
      <div className="page-heading">
        <Link className="mb-3 inline-block text-sm font-bold text-indigo-700 hover:text-indigo-900" href="/categories">&lt;- All categories</Link>
        <div className="flex flex-wrap items-center gap-3"><h1>{category.name}</h1><span className="badge">{category.status}</span></div>
        <p>{products.length} {products.length === 1 ? "product" : "products"} in this category.</p>
      </div>
      {products.length === 0 ? <div className="state-card">No products are available in this category.</div> : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => <article key={product.id} className="card flex flex-col overflow-hidden">
            <div className="relative h-52"><Image src={getStoreImage(`${product.name} ${category.name}`)} alt={product.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" /></div>
            <div className="flex flex-1 flex-col p-5"><div className="flex items-start justify-between gap-3"><h2 className="text-xl font-bold text-slate-900">{product.name}</h2><strong className="text-lg text-indigo-700">${product.price.toFixed(2)}</strong></div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{product.description || "No description provided."}</p>
              <div className="mt-auto flex items-center justify-between pt-5 text-sm"><span className={product.stock > 0 ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>{product.stock} in stock</span><span className="badge">{product.status}</span></div>
              <div className="mt-5 flex gap-2"><Link className="button-secondary" href={`/products/${product.id}`}>Details</Link><BuyProductButton product={product} /></div>
            </div>
          </article>)}
        </div>
      )}
    </>
  );
}
