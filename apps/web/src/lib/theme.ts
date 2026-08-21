export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export const COLOR_MODES = [
  'amber',
  'blue',
  'pink',
  'rose',
  'emerald',
  'black',
] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export const COLOR_MODE_SWATCHES: Record<ColorMode, string> = {
  amber: '#d97706',
  blue: '#9333ea',
  pink: '#db2777',
  rose: '#e11d48',
  emerald: '#059669',
  black: '#171717',
};

export const THEME_STORAGE_KEY = 'pyramid.theme';
export const COLOR_MODE_STORAGE_KEY = 'pyramid.colorMode';

export const DEFAULT_THEME: Theme = 'light';
export const DEFAULT_COLOR_MODE: ColorMode = 'black';

export function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

export function isColorMode(value: unknown): value is ColorMode {
  return COLOR_MODES.includes(value as ColorMode);
}
