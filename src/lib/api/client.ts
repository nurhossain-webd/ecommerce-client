import type { ApiValidationError } from "../../types";
import { ApiError, isAbortError } from "./errors";

const API_URL = (process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5001").replace(/\/+$/, "");
export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";
export const AUTH_TOKEN_KEY = "auth_token";
export const AUTH_USER_KEY = "auth_user";

type QueryValue = string | number | boolean | null | undefined;
export type ApiOptions<TBody = unknown> = Omit<RequestInit, "body"> & {
  body?: TBody;
  auth?: boolean;
  /** Explicit per-request token for server callers; never stored in module state. */
  token?: string;
  query?: Record<string, QueryValue | readonly QueryValue[]>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validationErrors(value: unknown): ApiValidationError[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((issue): issue is ApiValidationError =>
    isRecord(issue) && typeof issue.field === "string" && typeof issue.message === "string",
  );
}

/** JSON transport. Endpoint methods supply request/response types; data is not schema-validated. */
export async function apiRequest<T, TBody = unknown>(
  path: string,
  { body, auth = false, token, query, headers, ...options }: ApiOptions<TBody> = {},
): Promise<T> {
  if (!path.startsWith("/api/")) throw new ApiError("Invalid API path", 0);
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined && item !== null) url.searchParams.append(key, String(item));
    }
  }

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Accept")) requestHeaders.set("Accept", "application/json");
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");
  if (auth || token !== undefined) {
    let accessToken = token;
    if (accessToken === undefined && typeof window !== "undefined") {
      try { accessToken = window.localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined; }
      catch { throw new ApiError("Session storage is unavailable. Please log in again.", 401); }
    }
    if (!accessToken) throw new ApiError("Please log in to continue", 401);
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const serializedBody = body === undefined ? undefined : JSON.stringify(body);
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      ...(requestHeaders.has("Authorization") ? { cache: "no-store" as const } : {}),
      headers: requestHeaders,
      body: serializedBody,
    });
  } catch (error) {
    if (isAbortError(error) || options.signal?.aborted) throw error;
    throw new ApiError("Unable to connect to the store. Please try again.", 0);
  }

  if (response.status === 401 && auth && token === undefined && typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
  }

  // Current resource endpoints return JSON, including DELETE. Empty endpoints use <void>.
  if (response.status === 204) return undefined as T;
  let payload: unknown;
  try { payload = await response.json(); }
  catch (error) {
    if (isAbortError(error) || options.signal?.aborted) throw error;
    throw new ApiError("The server returned an invalid response. Please try again.", response.status);
  }

  const envelope = isRecord(payload) ? payload : undefined;
  if (!response.ok || envelope?.success === false) {
    throw new ApiError(
      typeof envelope?.message === "string" ? envelope.message : "Request failed. Please try again.",
      response.status,
      validationErrors(envelope?.errors),
    );
  }
  if (envelope?.success !== true || typeof envelope.message !== "string" || !("data" in envelope)) {
    throw new ApiError("The server returned an invalid response. Please try again.", response.status);
  }
  return envelope.data as T;
}
