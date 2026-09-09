import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../../types";
import { apiRequest } from "./client";
import type { RequestOptions } from "./options";

const path = (id: string) => `/api/categories/${encodeURIComponent(id)}`;

export const categoriesApi = {
  list: (options?: RequestOptions) =>
    apiRequest<Category[]>("/api/categories", { ...options, auth: false }),
  get: (id: string, options?: RequestOptions) =>
    apiRequest<Category>(path(id), { ...options, auth: false }),
  create: (body: CreateCategoryInput, options?: RequestOptions) =>
    apiRequest<Category, CreateCategoryInput>("/api/categories", { ...options, method: "POST", auth: true, body }),
  update: (id: string, body: UpdateCategoryInput, options?: RequestOptions) =>
    apiRequest<Category, UpdateCategoryInput>(path(id), { ...options, method: "PATCH", auth: true, body }),
  remove: (id: string, options?: RequestOptions) =>
    apiRequest<Category>(path(id), { ...options, method: "DELETE", auth: true }),
};
