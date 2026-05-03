export const AUTH_BACKENDS = {
  supabase: 'supabase',
} as const;

export type AuthBackend = (typeof AUTH_BACKENDS)[keyof typeof AUTH_BACKENDS];

export const DATA_BACKENDS = {
  supabase: 'supabase',
  postgrest: 'postgrest',
} as const;

export type DataBackend = (typeof DATA_BACKENDS)[keyof typeof DATA_BACKENDS];

export const DEFAULT_AUTH_BACKEND: AuthBackend = AUTH_BACKENDS.supabase;
export const DEFAULT_DATA_BACKEND: DataBackend = DATA_BACKENDS.supabase;

export const SYNC_TARGETS = {
  sqlite: 'sqlite',
  supabase: 'supabase',
} as const;

export type SyncTarget = (typeof SYNC_TARGETS)[keyof typeof SYNC_TARGETS];
