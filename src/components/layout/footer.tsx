"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categoriesApi } from "@/lib/api";
import type { Category } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { Brand } from "./brand";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";

export function Footer() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    categoriesApi.list({ signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setCategories(data.filter((category) => category.status === "ACTIVE").slice(0, 4)); })
      .catch(() => { /* The all-categories link remains available if the API is offline. */ })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <footer className="mt-auto border-t border-line bg-white">
    <div className="page-shell flex flex-col justify-between gap-5 border-b border-line py-8 sm:flex-row sm:items-center sm:py-10"><div><p className="eyebrow mb-2">Made for your everyday</p><h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Good finds start with a little exploring.</h2></div><ButtonLink href="/products" variant="secondary" className="w-fit">Explore the collection<Icon name="arrow" className="size-4" /></ButtonLink></div>
    <div className="page-shell grid grid-cols-2 gap-x-6 gap-y-10 py-10 sm:grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-x-14 lg:py-14">
      <div className="col-span-2 sm:col-span-3 lg:col-span-1"><Brand /><p className="mt-5 max-w-xs text-sm leading-7 text-muted">A place to discover something for your home, your routine, and whatever comes next.</p><p className="mt-4 text-xs font-medium text-brand">A world of finds. All in one place.</p></div>
      <div><h3 className="eyebrow text-ink">The shop</h3><nav aria-label="Footer shop" className="mt-5 grid gap-3"><Link className="footer-link" href="/">Home</Link><Link className="footer-link" href="/products">All products</Link><Link className="footer-link" href="/categories">Shop by category</Link></nav></div>
      <div><h3 className="eyebrow text-ink">Your account</h3><nav aria-label="Footer account" className="mt-5 grid gap-3"><Link className="footer-link" href="/orders">Your orders</Link>{!authLoading && (user ? <>{user.role === "ADMIN" && <Link className="footer-link" href="/admin">Admin dashboard</Link>}<Link className="footer-link" href="/products">Continue shopping</Link></> : <><Link className="footer-link" href="/login">Log in</Link><Link className="footer-link" href="/register">Create an account</Link></>)}</nav></div>
      <div><h3 className="eyebrow text-ink">Explore</h3><nav aria-label="Footer categories" className="mt-5 grid gap-3">{loading ? <><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-20" /></> : categories.map((category) => <Link key={category.id} className="footer-link break-words" href={`/categories/${category.id}`}>{category.name}</Link>)}<Link className="footer-link inline-flex items-center gap-1.5" href="/categories">All categories<Icon name="arrow" className="size-3.5" /></Link></nav></div>
    </div>
    <div className="border-t border-line"><div className="page-shell flex flex-col justify-between gap-3 py-5 text-[11px] leading-5 text-muted sm:flex-row"><p>© {new Date().getFullYear()} ShopStack. All rights reserved.</p><p>Discover. Choose. Make it yours.</p></div></div>
  </footer>;
}
