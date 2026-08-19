'use client';

import * as Radix from '@radix-ui/react-popover';
import { cn } from '@/lib/cn';

export const Popover = Radix.Root;
export const PopoverTrigger = Radix.Trigger;
export const PopoverAnchor = Radix.Anchor;
export const PopoverClose = Radix.Close;

export function PopoverContent({
  className,
  align = 'end',
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof Radix.Content>) {
  return (
    <Radix.Portal>
      <Radix.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'overlay-animate z-50 rounded-xl border border-line bg-surface p-1 shadow-[var(--shadow-popover)] outline-none',
          className,
        )}
        {...props}
      />
    </Radix.Portal>
  );
}
