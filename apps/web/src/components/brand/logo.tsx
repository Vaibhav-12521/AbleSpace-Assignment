import { cn } from '@/lib/cn';

/** The Pyramid mark: white glyph on a near-black rounded square. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 w-5 items-center justify-center rounded-md bg-primary text-primary-fg',
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
        <path
          d="M8 1.6 13.6 13.2a.6.6 0 0 1-.54.87H2.94a.6.6 0 0 1-.54-.87L8 1.6Z"
          fill="currentColor"
        />
        <path d="M8 5.4 10.9 11.2H5.1L8 5.4Z" fill="#171717" opacity="0.55" />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight text-ink">
        Pyramid
      </span>
    </span>
  );
}
