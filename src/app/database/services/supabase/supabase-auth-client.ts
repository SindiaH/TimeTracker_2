import { Inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LOCAL_STORAGE_KEYS } from '@core/constants/storage-keys';
import { AuthBackendConfig } from '@environments/environment.types';
import { AUTH_BACKEND_CONFIG } from '@database/services/supabase/supabase-tokens';

@Injectable({ providedIn: 'root' })
export class SupabaseAuthClient {
  readonly client: SupabaseClient;

  constructor(@Inject(AUTH_BACKEND_CONFIG) config: AuthBackendConfig) {
    this.client = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: LOCAL_STORAGE_KEYS.auth,
        storage: window.localStorage,
        flowType: 'implicit',
      },
    });
  }
}
