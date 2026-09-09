import type { Product, ProductRecord, CreateProductInput, UpdateProductInput } from "../../types";
import { apiRequest } from "./client";
import type { RequestOptions } from "./options";

const path = (id: string) => `/api/products/${encodeURIComponent(id)}`;

export const productsApi = {
  list: (options?: RequestOptions) =>
    apiRequest<Product[]>("/api/products", { ...options, auth: false }),
  get: (id: string, options?: RequestOptions) =>
    apiRequest<Product>(path(id), { ...options, auth: false }),
  create: (body: CreateProductInput, options?: RequestOptions) =>
    apiRequest<ProductRecord, CreateProductInput>("/api/products", { ...options, method: "POST", auth: true, body }),
  update: (id: string, body: UpdateProductInput, options?: RequestOptions) =>
    apiRequest<ProductRecord, UpdateProductInput>(path(id), { ...options, method: "PATCH", auth: true, body }),
  remove: (id: string, options?: RequestOptions) =>
    apiRequest<ProductRecord>(path(id), { ...options, method: "DELETE", auth: true }),
};
