'use client';

import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export interface CalendarProps {
  selected?: Date | null;
  onSelect: (date: Date) => void;
  /** Month shown on first render when nothing is selected yet. */
  defaultMonth?: Date;
  className?: string;
}

/**
 * Month grid matching screen 8: caption with prev/next chevrons, two-letter
 * weekday row, selected day as a filled circle, adjacent-month days muted.
 *
 * Hand-rolled rather than pulled from a date-picker library — the design only
 * needs single-date selection, and this keeps full control over the markup.
 */
export function Calendar({
  selected,
  onSelect,
  defaultMonth,
  className,
}: CalendarProps) {
  const [month, setMonth] = useState(
    () => startOfMonth(selected ?? defaultMonth ?? new Date()),
  );

  // Always six rows so the popover doesn't resize between months.
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  return (
    <div className={cn('w-64 p-2', className)}>
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          aria-label="Previous month"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="text-[13px] font-medium text-ink">
          {format(month, 'MMMM yyyy')}
        </span>

        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="flex h-7 items-center justify-center text-[11px] text-ink-subtle"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const isSelected = selected ? isSameDay(day, selected) : false;
          const outside = !isSameMonth(day, month);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect(day)}
              // aria-pressed, not aria-selected: the button role doesn't
              // support aria-selected outside a listbox/grid.
              aria-pressed={isSelected}
              aria-label={format(day, 'd MMMM yyyy')}
              className={cn(
                'mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[12px] transition-colors',
                isSelected
                  ? 'bg-primary font-medium text-primary-fg'
                  : 'hover:bg-surface-hover',
                !isSelected && outside && 'text-ink-subtle',
                !isSelected && !outside && 'text-ink',
                !isSelected && isToday(day) && 'font-semibold text-accent',
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
