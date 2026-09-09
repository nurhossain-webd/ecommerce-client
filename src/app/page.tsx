"use client";
import { Alert } from "@/components/ui/alert";
import { StateCard } from "@/components/ui/state-card";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { productsApi, categoriesApi, getErrorMessage } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { getStoreImage, heroImage } from "@/lib/store-images";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Icon } from "@/components/ui/icon";
import { ProductCard } from "@/components/products/product-card";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      categoriesApi.list(),
      productsApi.list(),
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
    <div className="space-y-12 sm:space-y-16">
      <section className="card relative isolate min-h-[400px] sm:min-h-[460px] overflow-hidden text-white">
        <Image src={heroImage} alt="Modern clothing store interior" fill priority sizes="(max-width: 1200px) 100vw, 1180px" className="object-cover" />
        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-slate-950/95 via-slate-900/75 to-slate-900/20" />
        <div className="relative z-10 flex min-h-[400px] sm:min-h-[460px] max-w-3xl flex-col justify-center px-6 py-14 sm:px-12">
          <p className="text-sm font-bold uppercase tracking-[.24em] text-indigo-200">A little more everyday</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.12] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">Your everyday, with a little more possibility.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">From the things you need to the finds you didn’t know you loved. Discover something that fits your day.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/products">Shop all products<Icon name="arrow" className="size-4" /></ButtonLink>
            <ButtonLink variant="secondary" className="border-white/40 bg-white/10 text-white backdrop-blur hover:border-white/60 hover:bg-white/20" href="/categories">Explore categories</ButtonLink>
          </div>
          <a className="mt-8 w-fit text-xs text-slate-300 hover:text-white" href="https://unsplash.com" target="_blank" rel="noreferrer">Photo from Unsplash</a>
        </div>
      </section>

      {loading ? (
        <StateCard loading>Loading the store...</StateCard>
      ) : error ? (
        <Alert>{error}</Alert>
      ) : (
        <>
          <section>
            <SectionHeading title="A category for every curiosity" description="Start with what you love. See where it takes you." action={<ButtonLink href="/categories" variant="ghost">All categories<Icon name="arrow" className="size-4" /></ButtonLink>} />
            {categories.length === 0 ? <StateCard>No categories are available.</StateCard> : (
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
            <SectionHeading title="Explore the collection" description="A few finds to get you started." action={<ButtonLink href="/products" variant="ghost">All products<Icon name="arrow" className="size-4" /></ButtonLink>} />
            {featuredProducts.length === 0 ? <StateCard>No active products are available.</StateCard> : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((product) => <ProductCard key={product.id} product={product} featured />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
