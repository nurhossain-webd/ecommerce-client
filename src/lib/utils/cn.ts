/** Compose conditional class names without a runtime styling dependency. */
export function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}
