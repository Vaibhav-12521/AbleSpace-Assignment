'use client';

import * as Radix from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export const DropdownMenu = Radix.Root;
export const DropdownMenuTrigger = Radix.Trigger;
export const DropdownMenuSub = Radix.Sub;
export const DropdownMenuGroup = Radix.Group;

const SURFACE =
  'z-50 min-w-[10rem] overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-[var(--shadow-popover)]';

const ANIMATION = 'overlay-animate';

const ITEM =
  'relative flex cursor-default select-none items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-ink outline-none transition-colors data-[highlighted]:bg-surface-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:shrink-0 [&_svg]:text-ink-muted';

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  align = 'start',
  ...props
}: React.ComponentProps<typeof Radix.Content>) {
  return (
    <Radix.Portal>
      <Radix.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(SURFACE, ANIMATION, className)}
        {...props}
      />
    </Radix.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof Radix.Item>) {
  return <Radix.Item className={cn(ITEM, className)} {...props} />;
}

export function DropdownMenuRadioItem({
  className,
  checked,
  children,
  ...props
}: React.ComponentProps<typeof Radix.Item> & { checked?: boolean }) {
  return (
    <Radix.Item className={cn(ITEM, 'pr-7', className)} {...props}>
      {children}
      {checked && (
        <Check className="absolute right-2 h-3.5 w-3.5 text-ink" strokeWidth={2.5} />
      )}
    </Radix.Item>
  );
}

export function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Radix.SubTrigger>) {
  return (
    <Radix.SubTrigger
      className={cn(ITEM, 'pr-7 data-[state=open]:bg-surface-hover', className)}
      {...props}
    >
      {children}
      <ChevronRight className="absolute right-2 h-3.5 w-3.5" />
    </Radix.SubTrigger>
  );
}

export function DropdownMenuSubContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof Radix.SubContent>) {
  return (
    <Radix.Portal>
      <Radix.SubContent
        sideOffset={sideOffset}
        className={cn(SURFACE, ANIMATION, className)}
        {...props}
      />
    </Radix.Portal>
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof Radix.Label>) {
  return (
    <Radix.Label
      className={cn('px-2 py-1.5 text-[11px] text-ink-subtle', className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Radix.Separator>) {
  return (
    <Radix.Separator
      className={cn('-mx-1 my-1 h-px bg-line-subtle', className)}
      {...props}
    />
  );
}
