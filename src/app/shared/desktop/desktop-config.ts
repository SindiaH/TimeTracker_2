export type SyncTarget = 'sqllite' | 'supabase';

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

export const defaultDesktopConfig: IDesktopConfig = {
  version: '1',
  autoTracking: { autoStartTracking: false },
  windowOptions: { zoom: 1 },
  sqlLiteConfig: { folder: '' },
  syncConfig: {
    activitiesSyncType: 'supabase',
    tasksSyncType: 'supabase',
  },
};
