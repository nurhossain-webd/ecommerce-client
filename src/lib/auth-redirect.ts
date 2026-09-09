export function safeNextPath(value: string | null | undefined, fallback = "/products") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export function loginHref(destination: string) {
  return `/login?next=${encodeURIComponent(safeNextPath(destination))}`;
}

export function registerHref(destination: string) {
  return `/register?next=${encodeURIComponent(safeNextPath(destination))}`;
}

export function currentDestination(fallback = "/products") {
  if (typeof window === "undefined") return fallback;
  return safeNextPath(`${window.location.pathname}${window.location.search}`, fallback);
}
