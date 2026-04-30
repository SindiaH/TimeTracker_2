export const MODULE_DISPLAY_NAMES = {
  auth: 'Auth',
  tasks: 'Tasks',
  timeEntries: 'Time Entries',
  calendar: 'Calendar',
  activities: 'Activities',
  settings: 'Settings',
} as const;

export type ModuleDisplayName = (typeof MODULE_DISPLAY_NAMES)[keyof typeof MODULE_DISPLAY_NAMES];
