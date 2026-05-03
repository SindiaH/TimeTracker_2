import { APP_INITIALIZER, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { SharedModule } from '@shared/shared.module';
import { provideAppTransloco } from '@core/i18n/transloco-config';
import { TranslationService } from '@core/i18n/translation.service';
import { provideDatabaseBackends } from '@database/database.providers';
import { provideAppDateAdapter } from '@shared/providers/material-date.providers';
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
    provideAppDateAdapter('de-AT'),
    provideDatabaseBackends(),
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
