import { NgModule } from '@angular/core';
import { AUTH_SERVICE_TOKEN } from '@database/services/interfaces/auth-service.interface';
import { autoMockProvider } from '@testing/backend/auto-mock.factory';
import { createAuthServiceMockShape } from '@testing/backend/auth-service.mock';

@NgModule({
  providers: [autoMockProvider(AUTH_SERVICE_TOKEN, createAuthServiceMockShape())],
})
export class TestingBackendModule {}
