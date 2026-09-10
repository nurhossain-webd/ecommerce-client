"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedPage } from "@/components/auth/protected-page";
import { OrderStatusBadge, OrderStatusTimeline } from "@/components/orders/order-status";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ordersApi, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/dates";
import type { Order } from "@/lib/types";

function OrderDetailsContent() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    ordersApi.get(id)
      .then((data) => { if (!cancelled) setOrder(data); })
      .catch((caught) => { if (!cancelled) setError(getErrorMessage(caught)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="space-y-5" role="status" aria-label="Loading order"><Skeleton className="h-5 w-48" /><Skeleton className="h-28 w-full" /><Skeleton className="h-80 w-full" /></div>;
  if (error || !order) return <div className="space-y-5"><Alert>{error || "This order could not be found."}</Alert><ButtonLink href="/orders" variant="secondary">Back to orders</ButtonLink></div>;

  const itemCount = order.orderItems.reduce((total, item) => total + item.quantity, 0);
  return <div className="space-y-8">
    <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link className="transition hover:text-brand" href="/orders">Orders</Link><span aria-hidden="true" className="mx-2">/</span><span className="text-ink">#{order.id.slice(0, 8).toUpperCase()}</span></nav>
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow mb-2">Order details</p><h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Order #{order.id.slice(0, 8).toUpperCase()}</h1><p className="mt-2 text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p></div><OrderStatusBadge status={order.status} /></div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="overflow-hidden p-0"><div className="border-b border-line px-5 py-4 sm:px-6"><h2 className="text-lg font-semibold">Items ({itemCount})</h2></div><div className="divide-y divide-line">{order.orderItems.map((item) => <div key={item.id} className="flex items-start justify-between gap-5 px-5 py-5 sm:px-6"><div className="min-w-0"><Link className="font-semibold text-ink transition hover:text-brand" href={`/products/${item.productId}`}>{item.product.name}</Link><p className="mt-1 text-sm text-muted">{formatCurrency(item.price)} × {item.quantity}</p></div><p className="shrink-0 font-semibold">{formatCurrency(item.price * item.quantity)}</p></div>)}</div></Card>
      <div className="space-y-6"><Card><h2 className="text-lg font-semibold">Order summary</h2><div className="mt-5 flex items-center justify-between border-t border-line pt-5"><span className="font-medium">Final total</span><span className="text-xl font-semibold">{formatCurrency(order.totalPrice)}</span></div><p className="mt-3 text-xs leading-5 text-muted">Prices shown here were captured by ShopStack when the order was placed.</p></Card><Card><h2 className="mb-5 text-lg font-semibold">Status</h2><OrderStatusTimeline status={order.status} /></Card></div>
    </div>
  </div>;
}

export default function OrderDetailsPage() {
  return <ProtectedPage role="USER"><OrderDetailsContent /></ProtectedPage>;
}
