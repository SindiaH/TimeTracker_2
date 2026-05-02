import { InjectionToken } from '@angular/core';
import { AuthBackendConfig, DataBackendConfig } from '@environments/environment.types';

export const AUTH_BACKEND_CONFIG = new InjectionToken<AuthBackendConfig>('AUTH_BACKEND_CONFIG');
export const DATA_BACKEND_CONFIG = new InjectionToken<DataBackendConfig>('DATA_BACKEND_CONFIG');
