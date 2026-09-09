"use client";
import { formatDate } from "@/lib/utils/dates";
import { Alert } from "@/components/ui/alert";
import { StateCard } from "@/components/ui/state-card";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { categoriesApi, getErrorMessage } from "@/lib/api";
import type { Category } from "@/lib/types";
import { getStoreImage } from "@/lib/store-images";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { categoriesApi.list().then(setCategories).catch((caught) => setError(getErrorMessage(caught))).finally(() => setLoading(false)); }, []);
  return <><div className="page-heading"><h1>Categories</h1><p>Browse real categories from the API.</p></div>
    {loading ? <StateCard loading>Loading categories...</StateCard> : error ? <Alert>{error}</Alert> : categories.length === 0 ? <StateCard>No categories are available.</StateCard> :
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <Link key={category.id} href={`/categories/${category.id}`} className="card group overflow-hidden hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"><div className="relative h-48"><Image src={getStoreImage(category.name)} alt={category.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition duration-300 group-hover:scale-105" /></div><div className="p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-slate-900">{category.name}</h2><span className="badge">{category.status}</span></div><div className="mt-3 flex items-center justify-between text-sm"><span className="text-slate-500">Updated {formatDate(category.updatedAt)}</span><span className="font-bold text-indigo-700 group-hover:translate-x-1">View products -&gt;</span></div></div></Link>)}</div>}
  </>;
}
