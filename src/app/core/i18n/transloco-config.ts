import { isDevMode, Provider } from '@angular/core';
import { provideTransloco, TranslocoConfig } from '@jsverse/transloco';
import { TranslationLoader } from '@core/i18n/translation-loader';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from '@core/i18n/translation.types';

const config: Partial<TranslocoConfig> = {
  availableLangs: [...AVAILABLE_LANGUAGES],
  defaultLang: DEFAULT_LANGUAGE,
  fallbackLang: DEFAULT_LANGUAGE,
  reRenderOnLangChange: true,
  prodMode: !isDevMode(),
};

export function provideAppTransloco(): Provider[] {
  return [
    provideTransloco({
      config,
      loader: TranslationLoader,
    }),
  ];
}
