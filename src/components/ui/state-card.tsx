import type { ReactNode } from "react";
import { EmptyState } from "./empty-state";
import { Skeleton } from "./skeleton";

export function StateCard({ children, loading = false }: { children: ReactNode; loading?: boolean }) {
  if (!loading) return <EmptyState>{children}</EmptyState>;
  return <div className="state-card" role="status" aria-busy="true">
    <div aria-hidden="true" className="mx-auto mb-6 flex max-w-sm items-center gap-4"><Skeleton className="size-14 shrink-0" /><div className="flex-1 space-y-3"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-1/2" /></div></div>
    <span className="text-sm text-muted">{children}</span>
  </div>;
}
