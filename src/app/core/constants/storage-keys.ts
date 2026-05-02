export const LOCAL_STORAGE_KEYS = {
  language: 'time-tracker-language',
  theme: 'time-tracker-theme',
  auth: 'time-tracker-auth',
} as const;

export type LocalStorageKey = (typeof LOCAL_STORAGE_KEYS)[keyof typeof LOCAL_STORAGE_KEYS];

export const TAURI_STORE_FILES = {
  appSettings: 'appSettings.json',
} as const;

export type TauriStoreFile = (typeof TAURI_STORE_FILES)[keyof typeof TAURI_STORE_FILES];

export const TAURI_STORE_KEYS = {
  appSettings: 'app-settings',
  theme: 'theme',
} as const;

export type TauriStoreKey = (typeof TAURI_STORE_KEYS)[keyof typeof TAURI_STORE_KEYS];

export const SQLITE_DATABASE_FILENAME = 'database.sqlite';
