'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Button } from './button';
import { resolveConfirm, usePendingConfirm } from '@/lib/confirm';

export function ConfirmHost() {
  const request = usePendingConfirm();

  return (
    <Dialog.Root
      open={request !== null}
      onOpenChange={(open) => {
        if (!open) resolveConfirm(false);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fade-animate fixed inset-0 z-[70] bg-[var(--overlay)]" />
        <Dialog.Content className="overlay-animate fixed top-1/2 left-1/2 z-[71] w-[calc(100vw-2rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-surface p-4 shadow-[var(--shadow-popover)] outline-none">
          <Dialog.Title className="text-[14px] font-semibold tracking-tight text-ink">
            {request?.title ?? ''}
          </Dialog.Title>

          {request?.message ? (
            <Dialog.Description className="mt-1 text-[13px] text-ink-muted">
              {request.message}
            </Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">
              Confirm this action
            </Dialog.Description>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => resolveConfirm(false)}>
              Cancel
            </Button>
            <Button
              autoFocus
              variant={request?.destructive ? 'danger' : 'primary'}
              onClick={() => resolveConfirm(true)}
            >
              {request?.confirmLabel ?? 'Confirm'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
