"use client";

import type { ReactNode } from "react";
export { Dialog as AdminDialog, ConfirmDialog } from "@/components/ui/dialog";

export function AdminPageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow mb-2">Administration</p><h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p></div>{action}</div>;
}

export function AdminToolbar({ children }: { children: ReactNode }) {
  return <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center">{children}</div>;
}
