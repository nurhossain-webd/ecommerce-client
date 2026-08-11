import type { ApiEnvelope } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5001";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly errors?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown; auth?: boolean };

export async function apiRequest<T>(path: string, { body, auth = false, headers, ...options }: ApiOptions = {}): Promise<T> {
  const requestHeaders = new Headers(headers);
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");
  if (auth) {
    const token = typeof window === "undefined" ? null : localStorage.getItem("auth_token");
    if (!token) throw new ApiError("Please log in to continue", 401);
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers: requestHeaders, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError("Could not reach the API. Make sure the backend is running on port 5001.", 0);
  }

  const payload = (await response.json().catch(() => ({ success: false, message: "The server returned an invalid response" }))) as Partial<ApiEnvelope<T>>;
  if (!response.ok) {
    if (response.status === 401 && auth && typeof window !== "undefined") window.dispatchEvent(new Event("auth:unauthorized"));
    throw new ApiError(payload.message ?? "Request failed", response.status, payload.errors);
  }
  return payload.data as T;
}

export const getErrorMessage = (error: unknown) => error instanceof ApiError ? error.errors?.[0]?.message ?? error.message : error instanceof Error ? error.message : "Something went wrong";
