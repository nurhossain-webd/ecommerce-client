import type { ApiValidationError } from "../../types";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: ApiValidationError[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.errors?.[0]?.message || error.message;
  if (error instanceof Error) return error.message || "Something went wrong. Please try again.";
  return "Something went wrong. Please try again.";
}

export function getDetailedErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const messages = [...new Set((error.errors ?? []).map((issue) => issue.message))];
    return messages.length ? messages.join(" ") : error.message;
  }
  return getErrorMessage(error);
}

/** Retain nested paths (items.0.quantity) while stripping the validation location. */
export function getFieldErrors(error: unknown): Record<string, string> {
  const fields: Record<string, string> = Object.create(null);
  if (error instanceof ApiError) {
    for (const issue of error.errors ?? []) {
      const field = issue.field.replace(/^(body|params|query)\./, "");
      fields[field] ??= issue.message;
    }
  }
  return fields;
}
