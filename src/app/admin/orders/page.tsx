"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";

const statuses: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    return apiRequest<Order[]>("/api/orders/admin/all", { auth: true })
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
      const updated = await apiRequest<Order>(`/api/orders/admin/${order.id}/status`, { method: "PATCH", auth: true, body: { status } });
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
    {error && <div className="alert-error mb-4">{error}</div>}
    {message && <div className="alert-success mb-4">{message}</div>}
    {loading ? <div className="state-card">Loading all orders...</div> : orders.length === 0 ? <div className="state-card">No orders found.</div> : (
      <div className="grid gap-4">
        {orders.map((order) => <article key={order.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div><h2 className="font-black text-slate-900">Order #{order.id.slice(0, 8)}</h2><p className="mt-1 text-sm text-slate-500">{order.user?.name ?? "Customer"} - {order.user?.email ?? order.userId}</p><p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</p></div>
            <div className="flex items-end gap-3"><div className="field"><label htmlFor={`status-${order.id}`}>Order status</label><select id={`status-${order.id}`} className="input min-w-40" value={order.status} disabled={updatingId === order.id} onChange={(event) => changeStatus(order, event.target.value as OrderStatus)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div><strong className="pb-2 text-xl text-indigo-700">${order.totalPrice.toFixed(2)}</strong></div>
          </div>
          <div className="mt-4 grid gap-2">{order.orderItems.map((item) => <div key={item.id} className="flex justify-between gap-4 rounded-lg bg-slate-50 p-3 text-sm"><span><strong>{item.product.name}</strong> x {item.quantity}</span><strong>${(item.price * item.quantity).toFixed(2)}</strong></div>)}</div>
        </article>)}
      </div>
    )}
  </>;
}
