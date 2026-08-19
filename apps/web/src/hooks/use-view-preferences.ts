'use client';

import { useCallback, useEffect, useState } from 'react';

export type ViewMode = 'list' | 'board';

/**
 * Columns the Fields popover can toggle.
 *
 * The Figma lists "Members" twice (screens 3 and 7); that is a duplicate in
 * the source file, so a single Members toggle is rendered here. Noted in the
 * README.
 */
export const FIELD_KEYS = [
  'priority',
  'members',
  'dueDate',
  'labels',
  'status',
  'reporter',
] as const;

export type FieldKey = (typeof FIELD_KEYS)[number];

export const FIELD_LABELS: Record<FieldKey, string> = {
  priority: 'Priority',
  members: 'Members',
  dueDate: 'Due Date',
  labels: 'Labels',
  status: 'Status',
  reporter: 'Reporter',
};

export interface ViewPreferences {
  mode: ViewMode;
  fields: Record<FieldKey, boolean>;
}

// Matches the Figma's default: Priority, Members and Due Date on; the rest off.
const DEFAULTS: ViewPreferences = {
  mode: 'list',
  fields: {
    priority: true,
    members: true,
    dueDate: true,
    labels: false,
    status: false,
    reporter: false,
  },
};

function storageKey(scope: string) {
  return `pyramid.view.${scope}`;
}

/**
 * View mode and column visibility, persisted per scope so the Tasks and
 * Projects screens remember their own layouts.
 */
export function useViewPreferences(scope: string) {
  const [prefs, setPrefs] = useState<ViewPreferences>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  // Read after mount: localStorage isn't available during SSR, and reading it
  // during render would produce a hydration mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(scope));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ViewPreferences>;
        setPrefs({
          mode: parsed.mode === 'board' ? 'board' : 'list',
          fields: { ...DEFAULTS.fields, ...(parsed.fields ?? {}) },
        });
      }
    } catch {
      // Corrupt or unavailable storage falls back to the defaults.
    }
    setHydrated(true);
  }, [scope]);

  const persist = useCallback(
    (next: ViewPreferences) => {
      setPrefs(next);
      try {
        localStorage.setItem(storageKey(scope), JSON.stringify(next));
      } catch {
        // Non-fatal; the choice still applies for this session.
      }
    },
    [scope],
  );

  const setMode = useCallback(
    (mode: ViewMode) => persist({ ...prefs, mode }),
    [persist, prefs],
  );

  const toggleField = useCallback(
    (key: FieldKey, value: boolean) =>
      persist({ ...prefs, fields: { ...prefs.fields, [key]: value } }),
    [persist, prefs],
  );

  return { ...prefs, hydrated, setMode, toggleField };
}
