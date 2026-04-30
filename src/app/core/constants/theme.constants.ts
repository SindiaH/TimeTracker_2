export const THEME_PREFERENCES = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[keyof typeof THEME_PREFERENCES];

export const RESOLVED_THEMES = {
  light: THEME_PREFERENCES.light,
  dark: THEME_PREFERENCES.dark,
} as const;

export type ResolvedTheme = (typeof RESOLVED_THEMES)[keyof typeof RESOLVED_THEMES];

export const THEME_CLASS_NAMES = {
  light: 'theme-light',
  dark: 'theme-dark',
} as const satisfies Record<ResolvedTheme, string>;

export const PREFERS_DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

export const DEFAULT_THEME_PREFERENCE: ThemePreference = THEME_PREFERENCES.system;

export const THEME_PREFERENCE_VALUES: ReadonlyArray<ThemePreference> = [
  THEME_PREFERENCES.light,
  THEME_PREFERENCES.dark,
  THEME_PREFERENCES.system,
];
