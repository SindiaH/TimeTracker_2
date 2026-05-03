import { EnvironmentProviders, makeEnvironmentProviders, Provider } from '@angular/core';
import { environment } from '@environments/environment';
import { AUTH_SERVICE_TOKEN } from '@database/services/interfaces/auth-service.interface';
import { FOLDER_SERVICE_TOKEN } from '@database/services/interfaces/folder-service.interface';
import { TASK_SERVICE_TOKEN } from '@database/services/interfaces/task-service.interface';
import { SupabaseAuthService } from '@database/services/supabase/supabase-auth.service';
import { SupabaseFolderService } from '@database/services/supabase/supabase-folder.service';
import { SupabaseTaskService } from '@database/services/supabase/supabase-task.service';
import { AUTH_BACKEND_CONFIG, DATA_BACKEND_CONFIG } from '@database/services/supabase/supabase-tokens';

function authServiceProvider(): Provider {
  switch (environment.authBackend.type) {
    case 'supabase':
      return { provide: AUTH_SERVICE_TOKEN, useClass: SupabaseAuthService };
    default:
      throw new Error(`Unsupported auth backend: ${environment.authBackend.type}`);
  }
}

function taskServiceProvider(): Provider {
  switch (environment.dataBackend.type) {
    case 'supabase':
      return { provide: TASK_SERVICE_TOKEN, useClass: SupabaseTaskService };
    default:
      throw new Error(`Unsupported data backend: ${environment.dataBackend.type}`);
  }
}

function folderServiceProvider(): Provider {
  switch (environment.dataBackend.type) {
    case 'supabase':
      return { provide: FOLDER_SERVICE_TOKEN, useClass: SupabaseFolderService };
    default:
      throw new Error(`Unsupported data backend: ${environment.dataBackend.type}`);
  }
}

export function provideDatabaseBackends(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AUTH_BACKEND_CONFIG, useValue: environment.authBackend },
    { provide: DATA_BACKEND_CONFIG, useValue: environment.dataBackend },
    authServiceProvider(),
    taskServiceProvider(),
    folderServiceProvider(),
  ]);
}
