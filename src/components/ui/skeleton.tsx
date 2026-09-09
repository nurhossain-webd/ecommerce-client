import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton", className)} />;
}

export function CatalogSkeleton() {
  return <div role="status" aria-busy="true" aria-label="Loading products" className="space-y-8">
    <div className="space-y-3"><Skeleton className="h-9 w-48" /><Skeleton className="h-4 w-64 max-w-full" /></div>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((item) => <div key={item} className="card overflow-hidden p-3"><Skeleton className="aspect-[4/3] w-full" /><div className="space-y-3 p-3 pt-5"><Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/3" /><Skeleton className="mt-6 h-10 w-full" /></div></div>)}
    </div>
  </div>;
}
