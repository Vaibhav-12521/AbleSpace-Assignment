'use client';

import * as RadixSwitch from '@radix-ui/react-switch';
import { cn } from '@/lib/cn';

/**
 * The Fields menu draws these as small rounded squares with a check, not as
 * sliding tracks — see screens 3 and 7.
 */
export function Switch({
  checked,
  onCheckedChange,
  label,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <RadixSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
        checked
          ? 'border-primary bg-primary text-primary-fg'
          : 'border-line bg-surface-subtle',
        className,
      )}
    >
      <RadixSwitch.Thumb asChild>
        <svg
          viewBox="0 0 12 12"
          className={cn('h-3 w-3', checked ? 'opacity-100' : 'opacity-0')}
          aria-hidden="true"
        >
          <path
            d="M2.5 6.2 4.8 8.5 9.5 3.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </RadixSwitch.Thumb>
    </RadixSwitch.Root>
  );
}
