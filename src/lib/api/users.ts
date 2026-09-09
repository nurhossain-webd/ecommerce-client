import type { User, CreateUserInput, UpdateUserInput } from "../../types";
import { apiRequest } from "./client";
import type { RequestOptions } from "./options";

const path = (id: string) => `/api/users/${encodeURIComponent(id)}`;

export const usersApi = {
  list: (options?: RequestOptions) =>
    apiRequest<User[]>("/api/users", { ...options, auth: true }),
  get: (id: string, options?: RequestOptions) =>
    apiRequest<User>(path(id), { ...options, auth: true }),
  create: (body: CreateUserInput, options?: RequestOptions) =>
    apiRequest<User, CreateUserInput>("/api/users", { ...options, method: "POST", auth: true, body }),
  update: (id: string, body: UpdateUserInput, options?: RequestOptions) =>
    apiRequest<User, UpdateUserInput>(path(id), { ...options, method: "PATCH", auth: true, body }),
  remove: (id: string, options?: RequestOptions) =>
    apiRequest<User>(path(id), { ...options, method: "DELETE", auth: true }),
};
