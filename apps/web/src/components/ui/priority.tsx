import { cn } from '@/lib/cn';
import type { Priority } from '@/lib/types';

export const PRIORITY_ORDER: Priority[] = [
  'NO_PRIORITY',
  'URGENT',
  'HIGH',
  'MEDIUM',
  'LOW',
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  NO_PRIORITY: 'No Priority',
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

const PRIORITY_TEXT: Record<Priority, string> = {
  NO_PRIORITY: 'text-priority-none',
  URGENT: 'text-priority-urgent',
  HIGH: 'text-priority-high',
  MEDIUM: 'text-priority-medium',
  LOW: 'text-priority-low',
};

/** How many of the three ascending bars are filled at each level. */
const FILLED_BARS: Record<Priority, number> = {
  NO_PRIORITY: 0,
  URGENT: 3,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const BARS = [
  { x: 1, y: 8, height: 4 },
  { x: 5, y: 5, height: 7 },
  { x: 9, y: 2, height: 10 },
];

export function PriorityIcon({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  const filled = FILLED_BARS[priority];

  // No Priority reads as a single muted dash in the design rather than bars.
  if (priority === 'NO_PRIORITY') {
    return (
      <svg
        viewBox="0 0 14 14"
        className={cn('h-3.5 w-3.5', PRIORITY_TEXT[priority], className)}
        aria-hidden="true"
      >
        <rect x="2" y="10" width="4" height="1.75" rx="0.875" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 14 14"
      className={cn('h-3.5 w-3.5', PRIORITY_TEXT[priority], className)}
      aria-hidden="true"
    >
      {BARS.map((bar, index) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={bar.y}
          width="3"
          height={bar.height}
          rx="1"
          fill="currentColor"
          // Unfilled bars stay visible but recede, as in the design.
          opacity={index < filled ? 1 : 0.25}
        />
      ))}
    </svg>
  );
}

export function PriorityTag({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[13px]',
        PRIORITY_TEXT[priority],
        className,
      )}
    >
      <PriorityIcon priority={priority} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
