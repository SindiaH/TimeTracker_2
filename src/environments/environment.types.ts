import { AuthBackend, DataBackend } from '@environments/backend.constants';

export type AuthBackendConfig = {
  type: AuthBackend;
  url: string;
  anonKey: string;
  storageNamespace: string;
};

export type DataBackendConfig = {
  type: DataBackend;
  url: string;
  anonKey: string;
};

export type AppEnvironment = {
  production: boolean;
  envName: 'local' | 'development' | 'test' | 'production';
  authBackend: AuthBackendConfig;
  dataBackend: DataBackendConfig;
};
