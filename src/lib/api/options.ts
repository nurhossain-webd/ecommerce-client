import type { ApiOptions } from "./client";

// Resource methods own paths, methods, bodies and authentication requirements.
// Lists do not expose filters/pagination: the current backend ignores query params.
export type RequestOptions = Pick<ApiOptions, "signal" | "token" | "headers" | "cache">;
