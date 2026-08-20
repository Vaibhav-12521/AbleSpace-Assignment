'use client';

import { useCallback, useMemo } from 'react';
import { useStoredString, writeStorage } from '@/lib/persistent-store';

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

export type FieldMap = Record<FieldKey, boolean>;

export const FIELD_LABELS: Record<FieldKey, string> = {
  priority: 'Priority',
  members: 'Members',
  dueDate: 'Due Date',
  labels: 'Labels',
  status: 'Status',
  reporter: 'Reporter',
};

/**
 * Defaults are stored per view mode because the design's two layouts show
 * different fields: the list view (screen 4) has Priority / Members / Due Date
 * columns and no Labels column, while the board (screen 2) renders labels and
 * due dates on every card. One shared map couldn't reproduce both.
 */
const DEFAULT_FIELDS: Record<ViewMode, FieldMap> = {
  list: {
    priority: true,
    members: true,
    dueDate: true,
    labels: false,
    status: false,
    reporter: false,
  },
  board: {
    priority: false,
    members: true,
    dueDate: true,
    labels: true,
    status: false,
    reporter: false,
  },
};

interface StoredPreferences {
  mode: ViewMode;
  fieldsByMode: Record<ViewMode, FieldMap>;
}

function storageKey(scope: string) {
  return `pyramid.view.${scope}`;
}

function parse(raw: string | null): StoredPreferences {
  const fallback: StoredPreferences = {
    mode: 'list',
    fieldsByMode: DEFAULT_FIELDS,
  };
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredPreferences>;
    return {
      mode: parsed.mode === 'board' ? 'board' : 'list',
      fieldsByMode: {
        list: { ...DEFAULT_FIELDS.list, ...(parsed.fieldsByMode?.list ?? {}) },
        board: { ...DEFAULT_FIELDS.board, ...(parsed.fieldsByMode?.board ?? {}) },
      },
    };
  } catch {
    // Corrupt JSON falls back to the defaults rather than throwing on render.
    return fallback;
  }
}

/**
 * View mode and column visibility, persisted per scope so the Tasks and
 * Projects screens remember their own layouts across refreshes.
 */
export function useViewPreferences(scope: string) {
  const key = storageKey(scope);
  const raw = useStoredString(key);

  // Parsing is memoised on the raw string so the object identity is stable
  // between renders.
  const prefs = useMemo(() => parse(raw), [raw]);

  const setMode = useCallback(
    (mode: ViewMode) => writeStorage(key, JSON.stringify({ ...prefs, mode })),
    [key, prefs],
  );

  const toggleField = useCallback(
    (field: FieldKey, value: boolean) =>
      writeStorage(
        key,
        JSON.stringify({
          ...prefs,
          fieldsByMode: {
            ...prefs.fieldsByMode,
            [prefs.mode]: { ...prefs.fieldsByMode[prefs.mode], [field]: value },
          },
        }),
      ),
    [key, prefs],
  );

  return {
    mode: prefs.mode,
    fields: prefs.fieldsByMode[prefs.mode],
    setMode,
    toggleField,
  };
}
