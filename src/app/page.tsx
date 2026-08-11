"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { getStoreImage, heroImage } from "@/lib/store-images";
import { BuyProductButton } from "@/components/buy-product-button";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest<Category[]>("/api/categories"),
      apiRequest<Product[]>("/api/products"),
    ])
      .then(([categoryData, productData]) => {
        setCategories(categoryData);
        setProducts(productData);
      })
      .catch((caught) => setError(getErrorMessage(caught)))
      .finally(() => setLoading(false));
  }, []);

  const featuredProducts = useMemo(
    () => products.filter((product) => product.status === "ACTIVE").slice(0, 6),
    [products],
  );

  return (
    <div className="space-y-12">
      <section className="card relative isolate min-h-[520px] overflow-hidden text-white">
        <Image src={heroImage} alt="Modern clothing store interior" fill priority sizes="(max-width: 1200px) 100vw, 1180px" className="object-cover" />
        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-slate-950/95 via-slate-900/75 to-slate-900/20" />
        <div className="relative z-10 flex min-h-[520px] max-w-3xl flex-col justify-center px-6 py-14 sm:px-12">
          <p className="text-sm font-bold uppercase tracking-[.24em] text-indigo-200">ShopStack marketplace</p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">Everything you need, all in one place.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">Browse live inventory, discover categories, and place secure orders with prices verified by the backend.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-500" href="/products">Shop all products</Link>
            <Link className="rounded-lg border border-white/50 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/20" href="/categories">Explore categories</Link>
          </div>
          <a className="mt-8 w-fit text-xs text-slate-300 hover:text-white" href="https://unsplash.com" target="_blank" rel="noreferrer">Photo from Unsplash</a>
        </div>
      </section>

      {loading ? (
        <div className="state-card">Loading the store...</div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
        <>
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div><h2 className="text-2xl font-black text-slate-900">Shop by category</h2><p className="mt-1 text-slate-500">Choose a category to see its products.</p></div>
              <Link className="text-sm font-bold text-indigo-700 hover:text-indigo-900" href="/categories">View all</Link>
            </div>
            {categories.length === 0 ? <div className="state-card">No categories are available.</div> : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.slice(0, 8).map((category) => {
                  const count = products.filter((product) => product.categoryId === category.id).length;
                  return <Link key={category.id} href={`/categories/${category.id}`} className="card group overflow-hidden hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg">
                    <div className="relative h-40 overflow-hidden"><Image src={getStoreImage(category.name)} alt={category.name} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition duration-300 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" /></div>
                    <div className="p-5"><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold text-slate-900">{category.name}</h3><p className="mt-1 text-sm text-slate-500">{count} {count === 1 ? "product" : "products"}</p></div><span className="text-xl text-indigo-600 transition group-hover:translate-x-1">-&gt;</span></div></div>
                  </Link>;
                })}
              </div>
            )}
          </section>

          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div><h2 className="text-2xl font-black text-slate-900">Featured products</h2><p className="mt-1 text-slate-500">Available products from the live catalog.</p></div>
              <Link className="text-sm font-bold text-indigo-700 hover:text-indigo-900" href="/products">View all</Link>
            </div>
            {featuredProducts.length === 0 ? <div className="state-card">No active products are available.</div> : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((product) => <article key={product.id} className="card flex flex-col overflow-hidden">
                  <div className="relative h-52 bg-slate-100"><Image src={getStoreImage(`${product.name} ${product.category?.name ?? ""}`)} alt={product.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" /></div>
                  <div className="flex flex-1 flex-col p-5"><span className="badge w-fit">{product.category?.name ?? "Product"}</span>
                    <div className="mt-4 flex items-start justify-between gap-3"><h3 className="text-xl font-bold text-slate-900">{product.name}</h3><strong className="text-lg text-indigo-700">${product.price.toFixed(2)}</strong></div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{product.description || "No description provided."}</p>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5"><span className="text-sm font-semibold text-emerald-700">{product.stock} in stock</span><div className="flex gap-2"><Link className="button-secondary" href={`/products/${product.id}`}>Details</Link><BuyProductButton product={product} /></div></div>
                  </div>
                </article>)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
