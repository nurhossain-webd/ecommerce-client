"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedPage } from "@/components/protected-page";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest<Order[]>("/api/orders", { auth: true }).then(setOrders).catch((caught) => setError(getErrorMessage(caught))).finally(() => setLoading(false)); }, []);
  return <><div className="page-heading"><h1>My Orders</h1><p>Orders are filtered using your verified JWT identity.</p></div>
    {loading ? <div className="state-card">Loading your orders...</div> : error ? <div className="alert-error">{error}</div> : orders.length === 0 ? <div className="state-card">You have no orders yet. <Link href="/products" className="font-bold text-indigo-700">Browse products</Link></div> :
      <div className="grid gap-5">{orders.map((order) => <article key={order.id} className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4"><div><h2 className="font-bold text-slate-900">Order #{order.id.slice(0, 8)}</h2><p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p></div><div className="text-right"><span className="badge">{order.status}</span><div className="mt-2 text-xl font-black text-indigo-700">${order.totalPrice.toFixed(2)}</div></div></div>
        <div className="mt-4 grid gap-3">{order.orderItems.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3"><div><strong>{item.product.name}</strong><p className="text-sm text-slate-500">${item.price.toFixed(2)} x {item.quantity}</p></div><strong>${(item.price * item.quantity).toFixed(2)}</strong></div>)}</div>
      </article>)}</div>}
  </>;
}
export default function OrdersPage() { return <ProtectedPage><OrdersContent /></ProtectedPage>; }
