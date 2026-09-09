type DateInput = string | number | Date | null | undefined;
type DateOptions = Pick<Intl.DateTimeFormatOptions, "dateStyle" | "timeStyle" | "timeZone" | "hour12"> & { locale?: string };

function format(value: DateInput, defaults: Intl.DateTimeFormatOptions, options: DateOptions): string {
  if (value === null || value === undefined || value === "") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const { locale = "en-US", ...formatOptions } = options;
  // A deterministic default avoids server/browser timezone hydration differences.
  return new Intl.DateTimeFormat(locale, { ...defaults, timeZone: "UTC", ...formatOptions }).format(date);
}

export function formatDate(value: DateInput, options: DateOptions = {}): string {
  return format(value, { dateStyle: "medium" }, options);
}

export function formatDateTime(value: DateInput, options: DateOptions = {}): string {
  return format(value, { dateStyle: "medium", timeStyle: "short" }, options);
}
