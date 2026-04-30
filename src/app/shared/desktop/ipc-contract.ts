export type DesktopPlatform = 'macos' | 'win32' | 'linux';

export interface ActiveWindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ActiveWindowOwner {
  name: string;
  processId: number;
  bundleId: string;
  path: string;
}

export interface ActiveWindowInfo {
  title: string;
  id: number;
  bounds: ActiveWindowBounds;
  owner: ActiveWindowOwner;
  url: string;
  memoryUsage: number;
  platform: DesktopPlatform;
}

export interface SecondInstancePayload {
  argv: string[];
  cwd: string;
}

export interface DesktopCommands {
  activity_get_active_window: { args: void; result: ActiveWindowInfo | null };
  idle_get_system_idle_time: { args: void; result: number };
  system_get_hostname: { args: void; result: string };
}

export interface DesktopEvents {
  'app:deep-link': string;
  'app:second-instance': SecondInstancePayload;
}
