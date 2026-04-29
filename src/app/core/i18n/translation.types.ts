import { Translation } from '@jsverse/transloco';

export type LanguageId = 'en-US' | 'de-AT';

export type Locale = {
  langId: LanguageId;
  data: Translation;
};

export const AVAILABLE_LANGUAGES: ReadonlyArray<LanguageId> = ['en-US', 'de-AT'];
export const DEFAULT_LANGUAGE: LanguageId = 'en-US';
export const LANGUAGE_STORAGE_KEY = 'time-tracker-language';
