'use client';

import * as RadixAvatar from '@radix-ui/react-avatar';
import { cn } from '@/lib/cn';

const SIZES = {
  xs: 'h-4 w-4 text-[8px]',
  sm: 'h-5 w-5 text-[9px]',
  md: 'h-6 w-6 text-[10px]',
  lg: 'h-8 w-8 text-xs',
  xl: 'h-14 w-14 text-lg',
} as const;

export type AvatarSize = keyof typeof SIZES;

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  return (
    <RadixAvatar.Root
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full',
        SIZES[size],
        className,
      )}
    >
      {src ? (
        <RadixAvatar.Image
          src={src}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : null}
      <RadixAvatar.Fallback
        className="flex h-full w-full items-center justify-center bg-surface-subtle font-medium text-ink-muted uppercase"
        // Rendered immediately when there is no image to wait for.
        delayMs={src ? 300 : undefined}
      >
        {initials(name)}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}

export interface AvatarGroupProps {
  people: Array<{ id: string; name: string; avatarUrl?: string | null }>;
  size?: AvatarSize;
  max?: number;
  className?: string;
}

/** Overlapping avatar stack with a "+N" pill once the list runs past `max`. */
export function AvatarGroup({
  people,
  size = 'md',
  max = 3,
  className,
}: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;

  return (
    <div className={cn('flex items-center', className)}>
      {shown.map((person, index) => (
        <Avatar
          key={person.id}
          name={person.name}
          src={person.avatarUrl}
          size={size}
          className={cn(
            'ring-2 ring-surface',
            index > 0 && '-ml-1.5',
          )}
        />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            'z-10 -ml-1.5 inline-flex items-center justify-center rounded-full bg-surface-subtle px-1 font-medium text-ink-muted ring-2 ring-surface',
            SIZES[size],
            'w-auto min-w-5',
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts[0][0] + parts[parts.length - 1][0];
}
