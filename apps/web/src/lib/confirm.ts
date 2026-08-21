'use client';

import { useSyncExternalStore } from 'react';

export interface ConfirmRequest {
  id: number;
  title: string;
  message?: string;
  confirmLabel: string;
  destructive: boolean;
}

interface PendingConfirm extends ConfirmRequest {
  resolve: (confirmed: boolean) => void;
}

let pending: PendingConfirm | null = null;
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function confirmAction(input: {
  title: string;
  message?: string;
  confirmLabel?: string;
  destructive?: boolean;
}): Promise<boolean> {
  pending?.resolve(false);

  return new Promise<boolean>((resolve) => {
    pending = {
      id: nextId++,
      title: input.title,
      message: input.message,
      confirmLabel: input.confirmLabel ?? 'Confirm',
      destructive: input.destructive ?? false,
      resolve,
    };
    emit();
  });
}

export function resolveConfirm(confirmed: boolean) {
  const current = pending;
  if (!current) return;
  pending = null;
  emit();
  current.resolve(confirmed);
}

export function usePendingConfirm(): ConfirmRequest | null {
  return useSyncExternalStore(
    subscribe,
    () => pending,
    () => null,
  );
}
