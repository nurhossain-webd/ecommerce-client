"use client";
import { OrderItems } from "@/components/orders/order-items";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/dates";
import { Alert } from "@/components/ui/alert";
import { StateCard } from "@/components/ui/state-card";

import { useCallback, useEffect, useState } from "react";
import { ordersApi, getErrorMessage } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";

import { ORDER_STATUSES } from "@/lib/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    return ordersApi.listAll()
      .then(setOrders)
      .catch((caught) => setError(getErrorMessage(caught)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (order: Order, status: OrderStatus) => {
    setUpdatingId(order.id);
    setError("");
    setMessage("");
    try {
      const updated = await ordersApi.updateStatus(order.id, { status });
      setOrders((current) => current.map((item) => item.id === order.id ? updated : item));
      setMessage(`Order #${order.id.slice(0, 8)} changed to ${status}.`);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setUpdatingId("");
    }
  };

  return <>
    <div className="page-heading"><h1>Manage Orders</h1><p>View every active order and update its fulfillment status.</p></div>
    {error && <Alert className="mb-4">{error}</Alert>}
    {message && <Alert variant="success" className="mb-4">{message}</Alert>}
    {loading ? <StateCard loading>Loading all orders...</StateCard> : orders.length === 0 ? <StateCard>No orders found.</StateCard> : (
      <div className="grid gap-4">
        {orders.map((order) => <article key={order.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div><h2 className="font-black text-slate-900">Order #{order.id.slice(0, 8)}</h2><p className="mt-1 text-sm text-slate-500">{order.user?.name ?? "Customer"} - {order.user?.email ?? order.userId}</p><p className="text-xs text-slate-400">{formatDateTime(order.createdAt)}</p></div>
            <div className="flex items-end gap-3"><div className="field"><label htmlFor={`status-${order.id}`}>Order status</label><select id={`status-${order.id}`} className="input min-w-40" value={order.status} disabled={updatingId === order.id} onChange={(event) => changeStatus(order, event.target.value as OrderStatus)}>{ORDER_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></div><strong className="pb-2 text-xl text-indigo-700">{formatCurrency(order.totalPrice)}</strong></div>
          </div>
          <OrderItems items={order.orderItems} compact />
        </article>)}
      </div>
    )}
  </>;
}
