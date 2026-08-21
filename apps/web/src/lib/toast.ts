'use client';

import { useSyncExternalStore } from 'react';

export type ToastVariant = 'error' | 'success' | 'info';

export interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

const DISMISS_AFTER_MS = 5000;

let toasts: Toast[] = [];
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

export function pushToast(input: {
  title: string;
  description?: string;
  variant?: ToastVariant;
}) {
  const toast: Toast = {
    id: nextId++,
    title: input.title,
    description: input.description,
    variant: input.variant ?? 'info',
  };

  toasts = [...toasts, toast];
  emit();

  setTimeout(() => dismissToast(toast.id), DISMISS_AFTER_MS);
  return toast.id;
}

export function dismissToast(id: number) {
  const next = toasts.filter((toast) => toast.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  emit();
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    subscribe,
    () => toasts,
    () => [],
  );
}
