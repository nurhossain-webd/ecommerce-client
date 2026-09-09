"use client";
import { OrderItems } from "@/components/orders/order-items";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/dates";
import { Alert } from "@/components/ui/alert";
import { StateCard } from "@/components/ui/state-card";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedPage } from "@/components/auth/protected-page";
import { ordersApi, getErrorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { ordersApi.list().then(setOrders).catch((caught) => setError(getErrorMessage(caught))).finally(() => setLoading(false)); }, []);
  return <><div className="page-heading"><h1>My Orders</h1><p>Orders are filtered using your verified JWT identity.</p></div>
    {loading ? <StateCard loading>Loading your orders...</StateCard> : error ? <Alert>{error}</Alert> : orders.length === 0 ? <StateCard>You have no orders yet. <Link href="/products" className="font-bold text-indigo-700">Browse products</Link></StateCard> :
      <div className="grid gap-5">{orders.map((order) => <article key={order.id} className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4"><div><h2 className="font-bold text-slate-900">Order #{order.id.slice(0, 8)}</h2><p className="text-sm text-slate-500">{formatDateTime(order.createdAt)}</p></div><div className="text-right"><span className="badge">{order.status}</span><div className="mt-2 text-xl font-black text-indigo-700">{formatCurrency(order.totalPrice)}</div></div></div>
        <OrderItems items={order.orderItems} />
      </article>)}</div>}
  </>;
}
export default function OrdersPage() { return <ProtectedPage><OrdersContent /></ProtectedPage>; }
