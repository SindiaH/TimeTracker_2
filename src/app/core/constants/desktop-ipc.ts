import { DesktopCommands, DesktopEvents } from '@shared/desktop/ipc-contract';

export const DESKTOP_COMMANDS = {
  systemGetHostname: 'system_get_hostname',
  activityGetActiveWindow: 'activity_get_active_window',
  idleGetSystemIdleTime: 'idle_get_system_idle_time',
} as const satisfies Record<string, keyof DesktopCommands>;

export type DesktopCommandName = (typeof DESKTOP_COMMANDS)[keyof typeof DESKTOP_COMMANDS];

export const DESKTOP_EVENTS = {
  appDeepLink: 'app:deep-link',
  appSecondInstance: 'app:second-instance',
} as const satisfies Record<string, keyof DesktopEvents>;

export type DesktopEventName = (typeof DESKTOP_EVENTS)[keyof typeof DESKTOP_EVENTS];
