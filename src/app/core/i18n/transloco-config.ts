import { isDevMode, Provider } from '@angular/core';
import { provideTransloco, TranslocoConfig } from '@jsverse/transloco';
import { AVAILABLE_LANGUAGE_IDS, DEFAULT_LANGUAGE_ID } from '@core/constants/language.constants';
import { TranslationLoader } from '@core/i18n/translation-loader';

const config: Partial<TranslocoConfig> = {
  availableLangs: [...AVAILABLE_LANGUAGE_IDS],
  defaultLang: DEFAULT_LANGUAGE_ID,
  fallbackLang: DEFAULT_LANGUAGE_ID,
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
