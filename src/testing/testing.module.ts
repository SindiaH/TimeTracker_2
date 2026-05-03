import { ChangeDetectorRef, NgModule } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DesktopService } from '@core/services/desktop/desktop.service';
import { ThemeService } from '@core/services/theme/theme.service';
import { TranslationService } from '@core/i18n/translation.service';
import { activatedRouteStub, ChangeDetectorRefStub, createRouterStub } from '@testing/stubs/angular.stubs';
import { DesktopServiceStub } from '@testing/stubs/desktop-service.stub';
import { ThemeServiceStub } from '@testing/stubs/theme-service.stub';
import { TranslationServiceStub } from '@testing/stubs/translation-service.stub';

@NgModule({
  providers: [
    { provide: DesktopService, useClass: DesktopServiceStub },
    { provide: ThemeService, useClass: ThemeServiceStub },
    { provide: TranslationService, useClass: TranslationServiceStub },
    { provide: ChangeDetectorRef, useClass: ChangeDetectorRefStub },
    { provide: Router, useFactory: createRouterStub },
    { provide: ActivatedRoute, useValue: activatedRouteStub },
  ],
})
export class TestingModule {}
