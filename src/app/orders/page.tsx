"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedPage } from "@/components/auth/protected-page";
import { OrderStatusBadge } from "@/components/orders/order-status";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ordersApi, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/dates";
import type { Order } from "@/lib/types";

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    ordersApi.list()
      .then((data) => {
        if (!cancelled) setOrders([...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      })
      .catch((caught) => { if (!cancelled) setError(getErrorMessage(caught)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return <div className="space-y-7">
    <div className="page-heading"><p className="eyebrow mb-3">Your account</p><h1>Order history</h1><p>Review your purchases, totals, and fulfillment status.</p></div>
    {loading ? <div className="space-y-3" aria-label="Loading orders" role="status"><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></div>
      : error ? <Alert>{error}</Alert>
      : orders.length === 0 ? <EmptyState title="No orders yet" action={<ButtonLink href="/products">Start shopping</ButtonLink>}>Your completed purchases will appear here.</EmptyState>
      : <div className="card overflow-hidden">
        {orders.map((order) => {
          const itemCount = order.orderItems.reduce((total, item) => total + item.quantity, 0);
          return <article key={order.id} className="flex flex-col justify-between gap-5 border-b border-line p-5 last:border-b-0 sm:flex-row sm:items-center sm:p-6">
            <div className="min-w-0 space-y-2"><div className="flex flex-wrap items-center gap-3"><h2 className="font-semibold text-ink">Order #{order.id.slice(0, 8).toUpperCase()}</h2><OrderStatusBadge status={order.status} /></div><div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted"><span>{formatDateTime(order.createdAt)}</span><span>{itemCount} item{itemCount === 1 ? "" : "s"}</span></div></div>
            <div className="flex shrink-0 items-center justify-between gap-5 sm:justify-end"><p className="text-lg font-semibold text-ink">{formatCurrency(order.totalPrice)}</p><Link className="rounded-lg px-2 py-1 text-sm font-semibold text-brand outline-none transition hover:text-brand-dark focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2" href={`/orders/${order.id}`}>View details</Link></div>
          </article>;
        })}
      </div>}
  </div>;
}

export default function OrdersPage() {
  return <ProtectedPage role="USER"><OrdersContent /></ProtectedPage>;
}
