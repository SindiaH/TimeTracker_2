import { NgModule } from '@angular/core';
import { AUTH_SERVICE_TOKEN } from '@database/services/interfaces/auth-service.interface';
import { FOLDER_SERVICE_TOKEN } from '@database/services/interfaces/folder-service.interface';
import { TASK_SERVICE_TOKEN } from '@database/services/interfaces/task-service.interface';
import { autoMockProvider } from '@testing/backend/auto-mock.factory';
import { createAuthServiceMockShape } from '@testing/backend/auth-service.mock';
import { createFolderServiceMockShape } from '@testing/backend/folder-service.mock';
import { createTaskServiceMockShape } from '@testing/backend/task-service.mock';

@NgModule({
  providers: [
    autoMockProvider(AUTH_SERVICE_TOKEN, createAuthServiceMockShape()),
    autoMockProvider(TASK_SERVICE_TOKEN, createTaskServiceMockShape()),
    autoMockProvider(FOLDER_SERVICE_TOKEN, createFolderServiceMockShape()),
  ],
})
export class TestingBackendModule {}
