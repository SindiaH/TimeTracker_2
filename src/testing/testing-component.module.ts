import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { BaseComponentsModule } from '@shared/base-components/base-components.module';
import { MaterialComponentsModule } from '@shared/material-components/material-components.module';
import { TestingBackendModule } from '@testing/backend/testing-backend.module';
import { TestingModule } from '@testing/testing.module';

@NgModule({
  imports: [
    NoopAnimationsModule,
    TestingModule,
    TestingBackendModule,
    BaseComponentsModule,
    MaterialComponentsModule,
    TranslatePipe,
  ],
  exports: [
    NoopAnimationsModule,
    TestingModule,
    TestingBackendModule,
    BaseComponentsModule,
    MaterialComponentsModule,
    TranslatePipe,
  ],
})
export class TestingComponentModule {}
