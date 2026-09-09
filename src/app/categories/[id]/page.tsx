"use client";
import { Alert } from "@/components/ui/alert";
import { StateCard } from "@/components/ui/state-card";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { productsApi, categoriesApi, getErrorMessage } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/products/product-card";

export default function CategoryProductsPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      categoriesApi.get(id),
      productsApi.list(),
    ])
      .then(([categoryData, productData]) => {
        setCategory(categoryData);
        setProducts(productData.filter((product) => product.categoryId === id));
      })
      .catch((caught) => setError(getErrorMessage(caught)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <StateCard loading>Loading category products...</StateCard>;
  if (error) return <><Alert>{error}</Alert><Link className="button-secondary mt-4" href="/categories">Back to categories</Link></>;
  if (!category) return <StateCard>Category not found.</StateCard>;

  return (
    <>
      <div className="page-heading">
        <Link className="mb-3 inline-block text-sm font-bold text-indigo-700 hover:text-indigo-900" href="/categories">&lt;- All categories</Link>
        <div className="flex flex-wrap items-center gap-3"><h1>{category.name}</h1><span className="badge">{category.status}</span></div>
        <p>{products.length} {products.length === 1 ? "product" : "products"} in this category.</p>
      </div>
      {products.length === 0 ? <StateCard>No products are available in this category.</StateCard> : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </>
  );
}
