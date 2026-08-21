'use client';

import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { dismissToast, useToasts, type ToastVariant } from '@/lib/toast';

const ICONS = {
  error: TriangleAlert,
  success: CircleCheck,
  info: Info,
} as const;

const ACCENTS: Record<ToastVariant, string> = {
  error: 'text-danger',
  success: 'text-priority-low',
  info: 'text-ink-muted',
};

export function Toaster() {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];

        return (
          <div
            key={toast.id}
            role={toast.variant === 'error' ? 'alert' : 'status'}
            className="overlay-animate pointer-events-auto flex w-full max-w-[360px] items-start gap-2.5 rounded-xl border border-line bg-surface p-3 shadow-[var(--shadow-popover)]"
            data-state="open"
          >
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', ACCENTS[toast.variant])} />

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-ink">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-[12px] break-words text-ink-muted">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-ink-subtle transition-colors hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
