export const APP_ICONS = {
  brand: 'schedule',
  themeLight: 'light_mode',
  themeDark: 'dark_mode',
  themeSystem: 'desktop_windows',
  navTasks: 'check_circle',
  navTimeEntries: 'schedule',
  navCalendar: 'calendar_month',
  navActivities: 'analytics',
  navSettings: 'settings',
  navAccount: 'account_circle',
  navShowcase: 'palette',
  menuOpen: 'menu',
  menuClose: 'close',
  signOut: 'logout',
} as const;

export type AppIcon = (typeof APP_ICONS)[keyof typeof APP_ICONS];
