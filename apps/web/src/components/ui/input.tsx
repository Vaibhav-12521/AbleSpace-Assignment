'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-8 w-full rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink',
        'placeholder:text-ink-subtle',
        'focus:outline-none focus-visible:outline-2 focus-visible:outline-accent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});

/**
 * Read-only-looking field used on the Settings profile form, where the design
 * shows values sitting in a filled box rather than a bordered input.
 */
export const FieldInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function FieldInput({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-8 w-full rounded-lg bg-surface-subtle px-2.5 text-[13px] text-ink',
        'placeholder:text-ink-subtle',
        'focus:outline-none focus-visible:outline-2 focus-visible:outline-accent',
        className,
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full resize-none rounded-lg bg-transparent text-[13px] text-ink',
        'placeholder:text-ink-subtle focus:outline-none',
        className,
      )}
      {...props}
    />
  );
});
