import { CalendarDays, Tag } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatShortDate, isOverdue } from '@/lib/date';
import type { Label } from '@/lib/types';

export function LabelChip({
  label,
  className,
}: {
  label: Pick<Label, 'name'>;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink-muted',
        className,
      )}
    >
      <Tag className="h-2.5 w-2.5" />
      {label.name}
    </span>
  );
}

export function DueDateBadge({
  date,
  className,
}: {
  date: string | Date | null | undefined;
  className?: string;
}) {
  if (!date) return null;

  return (
    <span
      title={isOverdue(date) ? 'Overdue' : undefined}
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-danger-soft px-1.5 py-0.5 text-[11px] font-medium text-danger',
        className,
      )}
    >
      <CalendarDays className="h-2.5 w-2.5" />
      {formatShortDate(date)}
    </span>
  );
}
