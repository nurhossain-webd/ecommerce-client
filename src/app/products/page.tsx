"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { productsApi, categoriesApi, ordersApi, getErrorMessage } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { isProductPurchasable } from "@/lib/utils/stock";
import { ProductCard } from "@/components/products/product-card";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { CatalogSkeleton } from "@/components/ui/skeleton";

type Availability = "all" | "available" | "unavailable";
type SortOrder = "latest" | "price-asc" | "price-desc";

const availabilityOptions: { value: Availability; label: string }[] = [
  { value: "all", label: "All products" },
  { value: "available", label: "In stock" },
  { value: "unavailable", label: "Unavailable" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const headerQuery = searchParams.get("q")?.trim() ?? "";
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(headerQuery);
  const [categoryId, setCategoryId] = useState("all");
  const [availability, setAvailability] = useState<Availability>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const loadCatalog = useCallback(() => {
    return Promise.all([productsApi.list(), categoriesApi.list()])
      .then(([productData, categoryData]) => {
        setError("");
        setProducts(productData);
        setCategories(categoryData.filter((category) => category.status === "ACTIVE"));
      })
      .catch((caught) => setError(getErrorMessage(caught)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCatalog(); }, [loadCatalog]);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return products
      .filter((product) => !term || `${product.name} ${product.description ?? ""}`.toLocaleLowerCase().includes(term))
      .filter((product) => categoryId === "all" || product.categoryId === categoryId)
      .filter((product) => {
        const available = product.status === "ACTIVE" && product.stock > 0;
        return availability === "all" || (availability === "available" ? available : !available);
      })
      .sort((left, right) => {
        if (sortOrder === "price-asc") return left.price - right.price;
        if (sortOrder === "price-desc") return right.price - left.price;
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      });
  }, [availability, categoryId, products, search, sortOrder]);

  const hasFilters = search.trim() !== "" || categoryId !== "all" || availability !== "all" || sortOrder !== "latest";
  const selectedItems = useMemo(
    () => Object.entries(quantities).filter(([, quantity]) => quantity > 0).map(([productId, quantity]) => ({ productId, quantity })),
    [quantities],
  );

  const createOrder = async () => {
    setError("");
    setSuccess("");
    if (!user) { setError("Log in before placing an order."); return; }
    if (selectedItems.length === 0) { setError("Choose at least one product quantity."); return; }
    setSubmitting(true);
    try {
      await ordersApi.create({ items: selectedItems });
      setSuccess("Order created successfully.");
      setQuantities({});
      await loadCatalog();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId("all");
    setAvailability("all");
    setSortOrder("latest");
  };

  const filters = (
    <div className="space-y-7">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">Category</legend>
        <label className="filter-option"><input type="radio" name="category" checked={categoryId === "all"} onChange={() => setCategoryId("all")} />All categories</label>
        {categories.map((category) => <label key={category.id} className="filter-option"><input type="radio" name="category" checked={categoryId === category.id} onChange={() => setCategoryId(category.id)} /><span className="min-w-0 truncate">{category.name}</span></label>)}
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">Availability</legend>
        {availabilityOptions.map((option) => <label key={option.value} className="filter-option"><input type="radio" name="availability" checked={availability === option.value} onChange={() => setAvailability(option.value)} />{option.label}</label>)}
      </fieldset>
      {hasFilters && <Button variant="ghost" className="w-full justify-start" onClick={clearFilters}><Icon name="refresh" className="size-4" />Clear all filters</Button>}
    </div>
  );

  return (
    <>
      <div className="page-heading">
        <p className="eyebrow mb-3">The ShopStack collection</p>
        <h1>Find your everyday favorites</h1>
        <p>Search, filter, and sort the live catalog to find exactly what fits your day.</p>
      </div>

      {error && <Alert className="mb-6">{error}<button type="button" className="ml-2 font-semibold underline underline-offset-4" onClick={loadCatalog}>Try again</button></Alert>}
      {success && <Alert variant="success" className="mb-6">{success} <Link className="font-semibold underline underline-offset-4" href="/orders">View orders</Link></Alert>}
      {loading ? <CatalogSkeleton /> : products.length === 0 ? (
        <EmptyState title="The catalog is empty" icon="bag">No products are available from the store right now.</EmptyState>
      ) : (
        <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden self-start rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-40 lg:block" aria-label="Product filters">
            <div className="mb-5 flex items-center gap-2 border-b border-line pb-4"><Icon name="sliders" className="size-4 text-brand" /><h2 className="text-sm font-semibold text-ink">Filters</h2></div>
            {filters}
          </aside>

          <section aria-labelledby="catalog-results-title" className="min-w-0">
            <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
              <label className="relative block"><span className="sr-only">Search products</span><Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted" /><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or description" className="pl-11" /></label>
              <label><span className="sr-only">Sort products</span><select className="input" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}><option value="latest">Latest first</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
              <Button variant="secondary" className="lg:hidden" aria-expanded={filtersOpen} aria-controls="mobile-product-filters" onClick={() => setFiltersOpen((current) => !current)}><Icon name="sliders" className="size-4" />Filters{hasFilters && <span className="size-2 rounded-full bg-brand" aria-label="Filters active" />}</Button>
            </div>

            {filtersOpen && <div id="mobile-product-filters" className="card mb-5 p-5 lg:hidden">{filters}</div>}

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p id="catalog-results-title" role="status" className="text-sm text-muted"><strong className="font-semibold text-ink">{visibleProducts.length}</strong> {visibleProducts.length === 1 ? "product" : "products"}</p>
              {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>}
            </div>

            {visibleProducts.length === 0 ? (
              <EmptyState icon="search" title="No products match" action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}>Try a different search or broaden your filters.</EmptyState>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => {
                  const available = isProductPurchasable(product);
                  return <ProductCard key={product.id} product={product}>
                    {user?.role !== "ADMIN" && <div className="mt-5 flex items-end justify-between gap-4 rounded-xl bg-surface p-3"><div><p className="text-xs font-semibold text-ink">Order directly</p><p className="mt-1 text-[11px] text-muted">Choose a quantity</p></div><label className="field w-20"><span className="sr-only">Quantity for {product.name}</span><Input type="number" min="0" max={product.stock} disabled={!available} value={quantities[product.id] ?? 0} onChange={(event) => setQuantities((current) => ({ ...current, [product.id]: Math.min(product.stock, Math.max(0, Number(event.target.value) || 0)) }))} /></label></div>}
                  </ProductCard>;
                })}
              </div>
            )}
          </section>
        </div>
      )}
      {!loading && products.length > 0 && user?.role !== "ADMIN" && <div className="card sticky bottom-4 z-20 mt-7 flex flex-col items-center justify-between gap-4 p-4 shadow-[0_12px_40px_rgb(36_31_68/0.12)] sm:flex-row"><div><p className="font-semibold text-ink">{selectedItems.length} selected product {selectedItems.length === 1 ? "line" : "lines"}</p><p className="mt-1 text-sm text-muted">Prices and stock are checked when the order is placed.</p></div>{user ? <Button disabled={submitting || selectedItems.length === 0} onClick={createOrder}>{submitting ? "Creating order..." : "Place order"}</Button> : <ButtonLink href="/login">Log in to order</ButtonLink>}</div>}
    </>
  );
}

export default function ProductsPage() {
  return <Suspense fallback={<CatalogSkeleton />}><ProductsContent /></Suspense>;
}
