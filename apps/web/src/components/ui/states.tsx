'use client';

import { Inbox, Loader2, TriangleAlert } from 'lucide-react';
import { Button } from './button';

/**
 * Loading, empty and error states.
 *
 * The Figma has no frames for any of these, so they are built from the same
 * tokens as the rest of the UI and kept deliberately plain. Noted in the
 * README as a documented addition.
 */

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex flex-1 items-center justify-center py-16 text-ink-muted"
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 py-16 text-center">
      <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-subtle text-ink-subtle">
        <Inbox className="h-4 w-4" />
      </span>
      <p className="text-[14px] font-medium text-ink">{title}</p>
      {description && (
        <p className="max-w-sm text-[13px] text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-1 px-6 py-16 text-center"
    >
      <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-danger-soft text-danger">
        <TriangleAlert className="h-4 w-4" />
      </span>
      <p className="text-[14px] font-medium text-ink">Something went wrong</p>
      <p className="max-w-sm text-[13px] text-ink-muted">{message}</p>
      {onRetry && (
        <Button className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
