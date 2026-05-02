import { AuthBackend, DataBackend } from '@core/constants/backend.constants';

export type AuthBackendConfig = {
  type: AuthBackend;
  url: string;
  anonKey: string;
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
