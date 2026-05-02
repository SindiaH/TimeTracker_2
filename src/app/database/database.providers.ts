import { EnvironmentProviders, makeEnvironmentProviders, Provider } from '@angular/core';
import { environment } from '@environments/environment';
import { AUTH_SERVICE_TOKEN } from '@database/services/interfaces/auth-service.interface';
import { SupabaseAuthService } from '@database/services/supabase/supabase-auth.service';
import { AUTH_BACKEND_CONFIG, DATA_BACKEND_CONFIG } from '@database/services/supabase/supabase-tokens';

function authServiceProvider(): Provider {
  switch (environment.authBackend.type) {
    case 'supabase':
      return { provide: AUTH_SERVICE_TOKEN, useClass: SupabaseAuthService };
    default:
      throw new Error(`Unsupported auth backend: ${environment.authBackend.type}`);
  }
}

export function provideDatabaseBackends(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AUTH_BACKEND_CONFIG, useValue: environment.authBackend },
    { provide: DATA_BACKEND_CONFIG, useValue: environment.dataBackend },
    authServiceProvider(),
  ]);
}
