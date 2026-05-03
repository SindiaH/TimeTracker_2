import { Inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAuthClient } from '@database/services/supabase/supabase-auth-client';
import { AUTH_BACKEND_CONFIG, DATA_BACKEND_CONFIG } from '@database/services/supabase/supabase-tokens';
import { AuthBackendConfig, DataBackendConfig } from '@environments/environment.types';

@Injectable({ providedIn: 'root' })
export class SupabaseDataClient {
  readonly client: SupabaseClient;

  constructor(
    authClient: SupabaseAuthClient,
    @Inject(AUTH_BACKEND_CONFIG) authConfig: AuthBackendConfig,
    @Inject(DATA_BACKEND_CONFIG) dataConfig: DataBackendConfig,
  ) {
    if (authConfig.url !== dataConfig.url) {
      throw new Error(
        '[SupabaseDataClient] Distinct auth and data backend URLs are not yet supported. Update environment configuration.',
      );
    }
    this.client = authClient.client;
  }
}
