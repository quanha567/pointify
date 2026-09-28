import { Skeleton } from '@/components/ui/skeleton';

export function AdminUsersSkeleton() {
  return (
    <div className="flex flex-col h-full w-full space-y-3.5 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-wrap items-end justify-between gap-3 shrink-0">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-3.5 w-80 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-[38px] w-24 rounded-md" />
          <Skeleton className="h-[38px] w-32 rounded-md" />
        </div>
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between gap-2.5 p-2 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="h-[38px] w-64 rounded-md" />
          <Skeleton className="h-[38px] w-28 rounded-md" />
          <Skeleton className="h-[38px] w-28 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-[38px] w-24 rounded-md" />
          <Skeleton className="h-[38px] w-20 rounded-md" />
        </div>
      </div>

      {/* Table Rows Skeleton */}
      <div className="flex-1 min-h-[400px] rounded-lg border border-border bg-card p-4 space-y-3">
        <Skeleton className="h-9 w-full rounded-md" />
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 py-2 border-b border-border/50">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-5 w-20 rounded-sm" />
            <Skeleton className="h-5 w-20 rounded-sm" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-6 w-6 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
