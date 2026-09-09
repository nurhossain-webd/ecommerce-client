import type { ReactNode } from "react";

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h2>{description && <p className="mt-2 text-sm leading-6 text-muted">{description}</p>}</div>{action}</div>;
}
