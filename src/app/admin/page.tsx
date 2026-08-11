"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Category, Product, User } from "@/lib/types";

type Counts = { users: number; products: number; categories: number; lowStock: number };

export default function AdminPage() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest<User[]>("/api/users", { auth: true }),
      apiRequest<Product[]>("/api/products"),
      apiRequest<Category[]>("/api/categories"),
    ])
      .then(([users, products, categories]) => setCounts({
        users: users.length,
        products: products.length,
        categories: categories.length,
        lowStock: products.filter((product) => product.stock <= 5).length,
      }))
      .catch((caught) => setError(getErrorMessage(caught)));
  }, []);

  const cards = [
    { label: "Active users", value: counts?.users, href: "/admin/users", tone: "bg-indigo-100 text-indigo-700" },
    { label: "Products", value: counts?.products, href: "/admin/products", tone: "bg-emerald-100 text-emerald-700" },
    { label: "Categories", value: counts?.categories, href: "/admin/categories", tone: "bg-violet-100 text-violet-700" },
    { label: "Low stock", value: counts?.lowStock, href: "/admin/products", tone: "bg-amber-100 text-amber-700" },
  ];

  return <>
    <div className="page-heading"><p className="text-sm font-bold uppercase tracking-wider text-indigo-600">Admin overview</p><h1>Welcome to your dashboard</h1><p>Monitor the live store and manage its resources.</p></div>
    {error && <div className="alert-error mb-5">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => <Link key={card.label} href={card.href} className="card p-5 hover:-translate-y-1 hover:border-indigo-300"><span className={`inline-flex rounded-lg px-3 py-1 text-xs font-bold ${card.tone}`}>{card.label}</span><div className="mt-5 text-4xl font-black text-slate-900">{card.value ?? "..."}</div><p className="mt-2 text-sm font-semibold text-slate-500">Open manager -&gt;</p></Link>)}
    </div>
    <div className="card mt-6 p-6">
      <h2 className="text-xl font-black text-slate-900">Quick actions</h2>
      <p className="mt-1 text-sm text-slate-500">Jump directly to the most common administrative tasks.</p>
      <div className="mt-5 flex flex-wrap gap-3"><Link className="button-primary" href="/admin/products">Add a product</Link><Link className="button-secondary" href="/admin/categories">Manage categories</Link><Link className="button-secondary" href="/admin/users">View users</Link></div>
    </div>
  </>;
}
