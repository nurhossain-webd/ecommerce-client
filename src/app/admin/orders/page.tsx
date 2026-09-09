"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader, AdminToolbar } from "@/components/admin/admin-ui";
import { OrderStatusBadge } from "@/components/orders/order-status";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateCard } from "@/components/ui/state-card";
import { getDetailedErrorMessage as getErrorMessage, ordersApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/dates";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let cancelled = false;
    ordersApi.listAll().then((data) => { if (!cancelled) setOrders(data); }).catch((caught) => { if (!cancelled) setError(getErrorMessage(caught)); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const filtered = useMemo(() => orders.filter((order) => { const query = search.trim().toLowerCase(); return (status === "ALL" || order.status === status) && (!query || `${order.id} ${order.user.name} ${order.user.email}`.toLowerCase().includes(query)); }), [orders, search, status]);
  const changeStatus = async (order: Order, nextStatus: OrderStatus) => { if (nextStatus === order.status) return; setUpdatingId(order.id); setError(""); setMessage(""); try { const updated = await ordersApi.updateStatus(order.id, { status: nextStatus }); setOrders((items) => items.map((item) => item.id === order.id ? updated : item)); setMessage(`Order #${order.id.slice(0, 8).toUpperCase()} updated to ${nextStatus}.`); } catch (caught) { setError(getErrorMessage(caught)); } finally { setUpdatingId(""); } };
  return <><AdminPageHeader title="Orders" description="View every active order and update its fulfillment status through the admin API." />{error && <Alert className="mb-5">{error}</Alert>}{message && <Alert variant="success" className="mb-5">{message}</Alert>}<AdminToolbar><Input type="search" placeholder="Search order or customer" aria-label="Search orders" value={search} onChange={(event) => setSearch(event.target.value)} className="sm:flex-1" /><select className="input sm:max-w-48" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter order status"><option value="ALL">All statuses</option>{ORDER_STATUSES.map((item) => <option key={item}>{item}</option>)}</select>{(search || status !== "ALL") && <Button variant="ghost" onClick={() => { setSearch(""); setStatus("ALL"); }}>Clear</Button>}</AdminToolbar><p className="mb-3 text-xs text-muted">{filtered.length} orders</p>{loading ? <StateCard loading>Loading orders...</StateCard> : filtered.length === 0 ? <StateCard>No orders match these filters.</StateCard> : <div className="card table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Update status</th></tr></thead><tbody>{filtered.map((order) => { const itemCount = order.orderItems.reduce((sum, item) => sum + item.quantity, 0); return <tr key={order.id}><td><strong className="text-ink">#{order.id.slice(0, 8).toUpperCase()}</strong><span className="mt-1 block whitespace-nowrap text-xs text-muted">{formatDateTime(order.createdAt)}</span></td><td><span className="font-medium text-ink">{order.user.name}</span><span className="block text-xs text-muted">{order.user.email}</span></td><td><span className="font-medium">{itemCount}</span><span className="mt-1 block max-w-52 truncate text-xs text-muted">{order.orderItems.map((item) => item.product.name).join(", ")}</span></td><td className="font-semibold">{formatCurrency(order.totalPrice)}</td><td><OrderStatusBadge status={order.status} /></td><td><select className="input min-w-40" aria-label={`Update order ${order.id} status`} value={order.status} disabled={updatingId === order.id} onChange={(event) => void changeStatus(order, event.target.value as OrderStatus)}>{ORDER_STATUSES.map((item) => <option key={item}>{item}</option>)}</select>{updatingId === order.id && <span className="mt-1 block text-xs text-muted">Updating...</span>}</td></tr>; })}</tbody></table></div>}</>;
}
