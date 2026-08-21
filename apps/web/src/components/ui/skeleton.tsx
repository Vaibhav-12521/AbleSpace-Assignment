import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-surface-subtle', className)}
    />
  );
}

export function ListSkeleton({ groups = 2, rows = 3 }: { groups?: number; rows?: number }) {
  return (
    <div role="status" aria-label="Loading tasks" className="space-y-5 px-4 pb-10 sm:px-6">
      {Array.from({ length: groups }).map((_, group) => (
        <div key={group} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="h-9 border-b border-line-subtle bg-surface-subtle" />
            {Array.from({ length: rows }).map((_, row) => (
              <div
                key={row}
                className="flex h-11 items-center gap-4 border-b border-line-subtle px-4 last:border-b-0"
              >
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="hidden h-3 w-16 sm:block" />
                <Skeleton className="hidden h-5 w-5 rounded-full sm:block" />
                <Skeleton className="hidden h-3 w-20 sm:block" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BoardSkeleton({ columns = 4 }: { columns?: number }) {
  const cardsPerColumn = [3, 2, 3, 2];

  return (
    <div
      role="status"
      aria-label="Loading board"
      className="flex flex-1 gap-4 overflow-hidden px-4 pb-10 sm:px-6"
    >
      {Array.from({ length: columns }).map((_, column) => (
        <div
          key={column}
          className="flex w-[280px] shrink-0 flex-col gap-2.5 self-start rounded-xl bg-surface-subtle p-2.5"
        >
          <div className="flex items-center gap-1.5 px-0.5">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>

          {Array.from({ length: cardsPerColumn[column % cardsPerColumn.length] }).map(
            (_, card) => (
              <div
                key={card}
                className="space-y-2 rounded-lg border border-line bg-surface p-2.5"
              >
                <Skeleton className="h-3 w-3/4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ),
          )}
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading task"
      className="flex flex-col gap-6 px-4 py-5 sm:px-6 lg:flex-row"
    >
      <div className="min-w-0 flex-1 space-y-5">
        <Skeleton className="h-6 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, row) => (
            <div key={row} className="flex items-center gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-40 rounded-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>

      <div className="lg:w-[280px]">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
