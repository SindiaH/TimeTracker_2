import { SYNC_TARGETS, SyncTarget } from '@environments/backend.constants';

export type { SyncTarget };

export interface IDesktopConfig {
  version: string;
  autoTracking: { autoStartTracking: boolean };
  windowOptions: { zoom: number };
  sqlLiteConfig: { folder: string };
  syncConfig: {
    activitiesSyncType: SyncTarget;
    tasksSyncType: SyncTarget;
  };
}

export const DESKTOP_CONFIG_VERSION = '1';
export const DEFAULT_WINDOW_ZOOM = 1;

export const defaultDesktopConfig: IDesktopConfig = {
  version: DESKTOP_CONFIG_VERSION,
  autoTracking: { autoStartTracking: false },
  windowOptions: { zoom: DEFAULT_WINDOW_ZOOM },
  sqlLiteConfig: { folder: '' },
  syncConfig: {
    activitiesSyncType: SYNC_TARGETS.supabase,
    tasksSyncType: SYNC_TARGETS.supabase,
  },
};
