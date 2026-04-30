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
  navAuth: 'lock',
} as const;

export type AppIcon = (typeof APP_ICONS)[keyof typeof APP_ICONS];
