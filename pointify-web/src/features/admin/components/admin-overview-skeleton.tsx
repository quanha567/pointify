import { Skeleton } from '@/components/ui/skeleton';

export function AdminOverviewSkeleton() {
  return (
    <div className="flex flex-col w-full animate-pulse">
      {/* Hero Banner Skeleton – Full Bleed matching OverviewHeroBanner */}
      <div className="h-36 sm:h-44 lg:h-48 w-full bg-muted/20 border-b border-border/40 flex flex-col justify-center px-6 sm:px-8 lg:px-10 space-y-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <Skeleton className="h-8 w-60 sm:w-80 rounded-md" />
          <Skeleton className="h-7 w-32 rounded-md" />
        </div>
        <Skeleton className="h-4 w-48 sm:w-72 rounded-lg" />
      </div>

      {/* Main Content Grid – Clean responsive padding */}
      <div className="flex flex-col space-y-5 px-4 sm:px-6 lg:px-7 pt-5 pb-8">
        {/* Row 1: 4 Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border/70 bg-card p-5 space-y-3 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="mt-3.5 flex items-end justify-between gap-2">
                <Skeleton className="h-8 w-20 rounded" />
                <Skeleton className="h-10 w-24 rounded-lg" />
              </div>
              <div className="mt-2.5 flex items-center gap-2 pt-1">
                <Skeleton className="h-3.5 w-10 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Recent Games (50%) + My Team (25%) + ONE Better Together Card (25%) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
          {/* Recent Games (Col 6) */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col rounded-lg border border-border/70 bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-1">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0"
                >
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-44 sm:w-56 rounded" />
                    <Skeleton className="h-3 w-28 rounded" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* My Team (Col 3) */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col rounded-lg border border-border/70 bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-1">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <div className="space-y-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Better Together Promo Card (Col 3) */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col rounded-lg bg-muted/40 p-5 space-y-4 shadow-2xs overflow-hidden">
            <Skeleton className="h-7 w-28 rounded" />
            <Skeleton className="h-10 w-32 rounded-lg" />
            <div className="mt-auto pt-6">
              <Skeleton className="h-32 w-full rounded-md" />
            </div>
          </div>
        </div>

        {/* Row 3: Recent Activity (33%) + Game Distribution (42%) + Quick Actions (25%) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
          {/* Recent Activity (Col 4) */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col rounded-lg border border-border/70 bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-1">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <Skeleton className="size-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-36 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Distribution (Col 5) */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col rounded-lg border border-border/70 bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-1">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="flex items-center justify-center py-4">
              <Skeleton className="size-40 rounded-full" />
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Skeleton className="h-4 w-16 rounded-sm" />
              <Skeleton className="h-4 w-16 rounded-sm" />
              <Skeleton className="h-4 w-16 rounded-sm" />
            </div>
          </div>

          {/* Quick Actions (Col 3) */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col rounded-lg border border-border/70 bg-card p-5 space-y-4 shadow-2xs">
            <Skeleton className="h-5 w-28 rounded" />
            <div className="space-y-2.5 pt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
