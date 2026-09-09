"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { OrderStatusBadge } from "@/components/orders/order-status";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesApi, getErrorMessage, ordersApi, productsApi, usersApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/dates";
import { LOW_STOCK_THRESHOLD } from "@/lib/utils/stock";
import type { Order } from "@/lib/types";

type Dashboard = { users: number; products: number; categories: number; orders: number; lowStock: number; recentOrders: Order[] };

export default function AdminPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    Promise.all([usersApi.list(), productsApi.list(), categoriesApi.list(), ordersApi.listAll()])
      .then(([users, products, categories, orders]) => { if (!cancelled) setData({ users: users.length, products: products.length, categories: categories.length, orders: orders.length, lowStock: products.filter((product) => product.stock <= LOW_STOCK_THRESHOLD).length, recentOrders: orders.slice(0, 5) }); })
      .catch((caught) => { if (!cancelled) setError(getErrorMessage(caught)); });
    return () => { cancelled = true; };
  }, []);

  const cards = [
    { label: "Products", value: data?.products, href: "/admin/products", color: "bg-indigo-50 text-indigo-700" },
    { label: "Categories", value: data?.categories, href: "/admin/categories", color: "bg-violet-50 text-violet-700" },
    { label: "Users", value: data?.users, href: "/admin/users", color: "bg-sky-50 text-sky-700" },
    { label: "Orders", value: data?.orders, href: "/admin/orders", color: "bg-emerald-50 text-emerald-700" },
    { label: "Low stock", value: data?.lowStock, href: "/admin/products", color: "bg-amber-50 text-amber-700" },
  ];
  return <><AdminPageHeader title="Overview" description="A live operational view calculated from ShopStack’s existing resource APIs." />{error && <Alert className="mb-5">{error}</Alert>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map((card) => <Link key={card.label} href={card.href} className="card p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"><span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${card.color}`}>{card.label}</span>{card.value === undefined ? <Skeleton className="mt-5 h-10 w-16" /> : <p className="mt-5 text-3xl font-semibold tracking-tight text-ink">{card.value}</p>}<p className="mt-2 text-xs text-muted">Open manager →</p></Link>)}</div><section className="card mt-6 overflow-hidden"><div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6"><div><h2 className="font-semibold text-ink">Recent orders</h2><p className="mt-1 text-xs text-muted">Latest orders returned by the admin API</p></div><Link href="/admin/orders" className="text-sm font-semibold text-brand hover:text-brand-hover">View all</Link></div>{!data && !error ? <div className="space-y-3 p-5"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div> : data?.recentOrders.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th></tr></thead><tbody>{data.recentOrders.map((order) => <tr key={order.id}><td className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</td><td><span className="font-medium text-ink">{order.user.name}</span><span className="block text-xs text-muted">{order.user.email}</span></td><td>{formatDateTime(order.createdAt)}</td><td><OrderStatusBadge status={order.status} /></td><td className="font-semibold">{formatCurrency(order.totalPrice)}</td></tr>)}</tbody></table></div> : <p className="p-8 text-center text-sm text-muted">No orders are available yet.</p>}</section></>;
}
