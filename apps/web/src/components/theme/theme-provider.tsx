'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  // Seeded from the defaults, then reconciled with what ThemeScript already
  // wrote onto <html>. Reading localStorage during render would break SSR.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [colorMode, setColorModeState] = useState<ColorMode>(DEFAULT_COLOR_MODE);

  useEffect(() => {
    const root = document.documentElement;
    const storedTheme = root.dataset.theme;
    const storedAccent = root.dataset.accent;

    if (isTheme(storedTheme)) setThemeState(storedTheme);
    if (isColorMode(storedAccent)) setColorModeState(storedAccent);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private-mode browsers can refuse writes; the in-memory choice still applies.
    }
  }, []);

  const setColorMode = useCallback((next: ColorMode) => {
    setColorModeState(next);
    document.documentElement.dataset.accent = next;
    try {
      localStorage.setItem(COLOR_MODE_STORAGE_KEY, next);
    } catch {
      // Same as above.
    }
  }, []);

  // Keep multiple tabs in sync.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === THEME_STORAGE_KEY && isTheme(event.newValue)) {
        setThemeState(event.newValue);
        document.documentElement.dataset.theme = event.newValue;
      }
      if (event.key === COLOR_MODE_STORAGE_KEY && isColorMode(event.newValue)) {
        setColorModeState(event.newValue);
        document.documentElement.dataset.accent = event.newValue;
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
