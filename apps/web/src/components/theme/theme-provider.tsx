'use client';

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useStoredString, writeStorage } from '@/lib/persistent-store';
import {
  COLOR_MODE_STORAGE_KEY,
  DEFAULT_COLOR_MODE,
  DEFAULT_THEME,
  isColorMode,
  isTheme,
  THEME_STORAGE_KEY,
  type ColorMode,
  type Theme,
} from '@/lib/theme';

interface ThemeContextValue {
  theme: Theme;
  colorMode: ColorMode;
  setTheme: (theme: Theme) => void;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // localStorage is the single source of truth, read through an external
  // store — so there is no local copy to keep in sync, and other tabs update
  // this one automatically.
  const storedTheme = useStoredString(THEME_STORAGE_KEY);
  const storedColorMode = useStoredString(COLOR_MODE_STORAGE_KEY);

  const theme = isTheme(storedTheme) ? storedTheme : DEFAULT_THEME;
  const colorMode = isColorMode(storedColorMode)
    ? storedColorMode
    : DEFAULT_COLOR_MODE;

  // ThemeScript sets these before first paint; these effects keep <html> in
  // step with later changes, including ones made in another tab.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.accent = colorMode;
  }, [colorMode]);

  const setTheme = useCallback((next: Theme) => {
    writeStorage(THEME_STORAGE_KEY, next);
  }, []);

  const setColorMode = useCallback((next: ColorMode) => {
    writeStorage(COLOR_MODE_STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ theme, colorMode, setTheme, setColorMode }),
    [theme, colorMode, setTheme, setColorMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
