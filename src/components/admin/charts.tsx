import type { ReactNode } from "react";

export type ChartDatum = { label: string; value: number; color?: string };

export function ChartCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="card p-5 sm:p-6"><h2 className="font-semibold text-ink">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-muted">{description}</p>}<div className="mt-6">{children}</div></section>;
}

export function BarChart({ data }: { data: ChartDatum[] }) {
  const maximum = Math.max(1, ...data.map((item) => item.value));
  return <div className="grid gap-4" role="img" aria-label={data.map((item) => `${item.label}: ${item.value}`).join(", ")}>{data.map((item) => <div key={item.label} className="grid grid-cols-[minmax(84px,auto)_1fr_auto] items-center gap-3"><span className="truncate text-xs font-medium text-muted">{item.label}</span><span className="h-2.5 overflow-hidden rounded-full bg-surface"><span className="block h-full min-w-0 rounded-full transition-[width] duration-500" style={{ width: `${item.value === 0 ? 0 : Math.max(5, item.value / maximum * 100)}%`, backgroundColor: item.color ?? "var(--brand)" }} /></span><strong className="min-w-7 text-right text-xs text-ink">{item.value}</strong></div>)}</div>;
}

export function DonutChart({ data, centerLabel = "Total" }: { data: ChartDatum[]; centerLabel?: string }) {
  const populated = data.filter((item) => item.value > 0);
  const total = populated.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const stops = populated.map((item, index) => { const start = cursor; cursor += item.value / Math.max(1, total) * 100; return `${item.color ?? ["#5145cd", "#16a34a", "#f59e0b", "#e11d48", "#64748b"][index % 5]} ${start}% ${cursor}%`; });
  return <div className="flex flex-col items-center gap-6 sm:flex-row"><div role="img" aria-label={data.map((item) => `${item.label}: ${item.value}`).join(", ")} className="relative size-36 shrink-0 rounded-full" style={{ background: total ? `conic-gradient(${stops.join(",")})` : "var(--surface)" }}><span className="absolute inset-5 grid place-items-center rounded-full bg-white text-center shadow-inner"><span><strong className="block text-2xl text-ink">{total}</strong><span className="text-[10px] uppercase tracking-wider text-muted">{centerLabel}</span></span></span></div><ul className="grid w-full gap-2.5">{data.map((item, index) => <li key={item.label} className="flex items-center justify-between gap-4 text-xs"><span className="flex min-w-0 items-center gap-2 text-muted"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color ?? ["#5145cd", "#16a34a", "#f59e0b", "#e11d48", "#64748b"][index % 5] }} /><span className="truncate">{item.label}</span></span><strong className="text-ink">{item.value}</strong></li>)}</ul></div>;
}
