"use client";
import { Alert } from "@/components/ui/alert";
import { StateCard } from "@/components/ui/state-card";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { productsApi, categoriesApi, getErrorMessage } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { heroImage } from "@/lib/store-images";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Icon } from "@/components/ui/icon";
import { ProductCard } from "@/components/products/product-card";
import { CategoryCard } from "@/components/categories/category-card";
import { CatalogSkeleton, Skeleton } from "@/components/ui/skeleton";

const benefits = [
  { icon: "shield" as const, title: "Secure ordering", text: "Your identity, price, and stock are verified by the store API." },
  { icon: "refresh" as const, title: "Live availability", text: "Browse product availability backed by the current catalog." },
  { icon: "sparkles" as const, title: "Curated discovery", text: "Explore useful finds across every active ShopStack category." },
];

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

  const latestProducts = useMemo(
    () => products
      .filter((product) => product.status === "ACTIVE")
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 6),
    [products],
  );

  const activeCategories = useMemo(
    () => categories.filter((category) => category.status === "ACTIVE").slice(0, 8),
    [categories],
  );

  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="card relative isolate min-h-[430px] overflow-hidden text-white sm:min-h-[500px]">
        <Image src={heroImage} alt="Modern clothing store interior" fill priority sizes="(max-width: 1200px) 100vw, 1180px" className="object-cover" />
        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-slate-950/95 via-slate-900/75 to-slate-900/20" />
        <div className="relative z-10 flex min-h-[430px] max-w-3xl flex-col justify-center px-6 py-14 sm:min-h-[500px] sm:px-12 lg:px-16">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-200">Thoughtful finds for everyday life</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">Discover products made for the way you live.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">Explore live collections, useful essentials, and new favorites—all together in one easy place.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/products">Shop products<Icon name="arrow" className="size-4" /></ButtonLink>
            <ButtonLink variant="secondary" className="border-white/40 bg-white/10 text-white backdrop-blur hover:border-white/60 hover:bg-white/20" href="/categories">Explore categories</ButtonLink>
          </div>
          <a className="mt-8 w-fit text-xs text-slate-300 hover:text-white" href="https://unsplash.com" target="_blank" rel="noreferrer">Photo from Unsplash</a>
        </div>
      </section>

      {loading ? (
        <div className="space-y-12" role="status" aria-label="Loading the storefront">
          <div><Skeleton className="mb-3 h-8 w-64 max-w-full" /><Skeleton className="mb-6 h-4 w-80 max-w-full" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="aspect-[4/3]" />)}</div></div>
          <CatalogSkeleton />
        </div>
      ) : error ? (
        <Alert>{error}</Alert>
      ) : (
        <>
          <section>
            <SectionHeading title="A category for every curiosity" description="Start with what you love. See where it takes you." action={<ButtonLink href="/categories" variant="ghost">All categories<Icon name="arrow" className="size-4" /></ButtonLink>} />
            {activeCategories.length === 0 ? <StateCard>No active categories are available.</StateCard> : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {activeCategories.map((category) => {
                  const count = products.filter((product) => product.categoryId === category.id).length;
                  return <CategoryCard key={category.id} category={category} productCount={count} />;
                })}
              </div>
            )}
          </section>

          <section>
            <SectionHeading title="Latest arrivals" description="The newest active products from the ShopStack catalog." action={<ButtonLink href="/products" variant="ghost">All products<Icon name="arrow" className="size-4" /></ButtonLink>} />
            {latestProducts.length === 0 ? <StateCard>No active products are available.</StateCard> : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {latestProducts.map((product) => <ProductCard key={product.id} product={product} featured />)}
              </div>
            )}
          </section>

          <section aria-labelledby="store-benefits-title" className="rounded-2xl border border-line bg-white px-5 py-8 sm:px-8 lg:px-10">
            <div className="mb-7"><p className="eyebrow mb-2">Why ShopStack</p><h2 id="store-benefits-title" className="text-2xl font-semibold tracking-tight text-ink">Shopping made clear and simple</h2></div>
            <div className="grid gap-7 md:grid-cols-3">
              {benefits.map((benefit) => <article key={benefit.title} className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Icon name={benefit.icon} className="size-5" /></span><div><h3 className="font-semibold text-ink">{benefit.title}</h3><p className="mt-2 text-sm leading-6 text-muted">{benefit.text}</p></div></article>)}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-2xl bg-[#28243f] px-6 py-12 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14 lg:py-14">
            <div className="absolute -right-16 -top-24 size-72 rounded-full bg-brand/35 blur-3xl" aria-hidden="true" />
            <div className="relative max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-indigo-200">Explore something new</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Your next favorite could be one category away.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">Browse the full collection by category and find the products that fit your day.</p></div>
            <ButtonLink href="/categories" className="relative mt-8 w-fit bg-white text-ink hover:border-white hover:bg-slate-100 lg:mt-0">Browse categories<Icon name="arrow" className="size-4" /></ButtonLink>
          </section>
        </>
      )}
    </div>
  );
}
