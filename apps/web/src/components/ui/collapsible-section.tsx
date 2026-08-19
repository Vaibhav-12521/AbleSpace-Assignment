'use client';

import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * "▾ To Do" group header used by the list and project views. The chevron
 * rotates rather than swapping icons so the transition stays smooth.
 */
export function CollapsibleSection({
  title,
  count,
  defaultOpen = true,
  className,
  children,
}: {
  title: React.ReactNode;
  count?: number;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className={cn('space-y-2', className)}
    >
      <Collapsible.Trigger className="group inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface-hover">
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-ink-muted transition-transform duration-150',
            !open && '-rotate-90',
          )}
        />
        {title}
        {typeof count === 'number' && (
          <span className="text-ink-subtle">{count}</span>
        )}
      </Collapsible.Trigger>

      <Collapsible.Content>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}

export function StatusDot({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      className={cn('inline-block h-2 w-2 shrink-0 rounded-full', className)}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}
