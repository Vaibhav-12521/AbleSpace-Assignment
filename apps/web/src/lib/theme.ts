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

/**
 * Swatch hexes shown in the Color Mode menu, taken from the Figma export.
 * The option labelled "Blue" is drawn with purple-600 in the design; that is
 * reproduced rather than corrected, and called out in the README.
 */
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

/**
 * Defaults to Black so a first load reproduces the Figma screens, which render
 * the UI in black even though the menu ticks "Blue".
 */
export const DEFAULT_THEME: Theme = 'light';
export const DEFAULT_COLOR_MODE: ColorMode = 'black';

export function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

export function isColorMode(value: unknown): value is ColorMode {
  return COLOR_MODES.includes(value as ColorMode);
}
