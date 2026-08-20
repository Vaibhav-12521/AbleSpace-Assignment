'use client';

import { useSyncExternalStore } from 'react';

/**
 * localStorage as a React external store.
 *
 * Reading persisted state with `useState` + `useEffect` means a second render
 * pass on every mount (and trips React's set-state-in-effect rule).
 * `useSyncExternalStore` reads the value during render instead, and gives
 * cross-tab sync for free because the `storage` event is part of the
 * subscription.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

/** Notifies same-tab subscribers; `storage` only fires in *other* tabs. */
function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private-mode browsers can refuse writes. Subscribers are still notified
    // so the UI reflects the choice for the rest of the session.
  }
  emit();
}

/**
 * Subscribes to one localStorage key. Returns the raw string so the snapshot
 * stays referentially stable — callers parse it with `useMemo`.
 */
export function useStoredString(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => readStorage(key),
    // Server render (and hydration) has no storage; fall back to defaults.
    () => null,
  );
}
