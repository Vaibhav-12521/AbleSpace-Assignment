import {
  COLOR_MODE_STORAGE_KEY,
  DEFAULT_COLOR_MODE,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
} from '@/lib/theme';

/**
 * Runs before first paint so a reload never flashes the wrong theme.
 *
 * It has to be inline and synchronous: React hydration happens after the
 * browser has already painted, so setting the attribute from an effect would
 * show a light frame first. Kept deliberately tiny and dependency-free.
 */
const script = `
(function () {
  try {
    var theme = localStorage.getItem('${THEME_STORAGE_KEY}');
    var accent = localStorage.getItem('${COLOR_MODE_STORAGE_KEY}');
    var root = document.documentElement;
    root.dataset.theme = (theme === 'light' || theme === 'dark') ? theme : '${DEFAULT_THEME}';
    root.dataset.accent = accent || '${DEFAULT_COLOR_MODE}';
  } catch (e) {
    document.documentElement.dataset.theme = '${DEFAULT_THEME}';
    document.documentElement.dataset.accent = '${DEFAULT_COLOR_MODE}';
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
