import type { Review, ReviewRecord, CreateReviewInput, UpdateReviewInput } from "../../types";
import { apiRequest } from "./client";
import type { RequestOptions } from "./options";

const path = (id: string) => `/api/reviews/${encodeURIComponent(id)}`;

export const reviewsApi = {
  list: (options?: RequestOptions) =>
    apiRequest<Review[]>("/api/reviews", { ...options, auth: false }),
  get: (id: string, options?: RequestOptions) =>
    apiRequest<Review>(path(id), { ...options, auth: false }),
  create: (body: CreateReviewInput, options?: RequestOptions) =>
    apiRequest<ReviewRecord, CreateReviewInput>("/api/reviews", { ...options, method: "POST", auth: true, body }),
  update: (id: string, body: UpdateReviewInput, options?: RequestOptions) =>
    apiRequest<ReviewRecord, UpdateReviewInput>(path(id), { ...options, method: "PATCH", auth: true, body }),
  remove: (id: string, options?: RequestOptions) =>
    apiRequest<ReviewRecord>(path(id), { ...options, method: "DELETE", auth: true }),
};
