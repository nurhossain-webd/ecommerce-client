import type { CreatedOrder, CustomerOrder, Order, OrderRecord, CreateOrderInput, UpdateOrderInput } from "../../types";
import { apiRequest } from "./client";
import type { RequestOptions } from "./options";

const path = (id: string) => `/api/orders/${encodeURIComponent(id)}`;

export const ordersApi = {
  list: (options?: RequestOptions) =>
    apiRequest<CustomerOrder[]>("/api/orders", { ...options, auth: true }),
  get: (id: string, options?: RequestOptions) =>
    apiRequest<CustomerOrder>(path(id), { ...options, auth: true }),
  create: (body: CreateOrderInput, options?: RequestOptions) =>
    apiRequest<CreatedOrder, CreateOrderInput>("/api/orders", { ...options, method: "POST", auth: true, body }),
  update: (id: string, body: UpdateOrderInput, options?: RequestOptions) =>
    apiRequest<OrderRecord, UpdateOrderInput>(path(id), { ...options, method: "PATCH", auth: true, body }),
  remove: (id: string, options?: RequestOptions) =>
    apiRequest<OrderRecord>(path(id), { ...options, method: "DELETE", auth: true }),
  listAll: (options?: RequestOptions) =>
    apiRequest<Order[]>("/api/orders/admin/all", { ...options, auth: true }),
  updateStatus: (id: string, body: UpdateOrderInput, options?: RequestOptions) =>
    apiRequest<Order, UpdateOrderInput>(`/api/orders/admin/${encodeURIComponent(id)}/status`, { ...options, method: "PATCH", auth: true, body }),
};
