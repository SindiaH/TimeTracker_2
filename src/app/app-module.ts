import { APP_INITIALIZER, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { APP_DATE_FORMATS } from '@core/i18n/date-formats';

import { SharedModule } from '@shared/shared.module';
import { provideAppTransloco } from '@core/i18n/transloco-config';
import { TranslationService } from '@core/i18n/translation.service';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

export function initializeTranslations(translationService: TranslationService): () => void {
  return (): void => {
    translationService.getSelectedLanguageId();
  };
}

@NgModule({
  declarations: [App],
  imports: [BrowserModule, BrowserAnimationsModule, SharedModule, AppRoutingModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideAppTransloco(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'de-AT' },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslations,
      deps: [TranslationService],
      multi: true,
    },
  ],
  bootstrap: [App],
})
export class AppModule {}
