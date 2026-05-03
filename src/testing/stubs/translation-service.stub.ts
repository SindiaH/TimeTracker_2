import { Injectable, Signal, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AVAILABLE_LANGUAGE_IDS, DEFAULT_LANGUAGE_ID, LanguageId } from '@core/constants/language.constants';
import { TranslationKey } from '@core/constants/translation-keys';
import { TESTING_TRANSLATE_PREFIX } from '@testing/constants/testing.constants';

type TranslateParams = Record<string, unknown>;

@Injectable()
export class TranslationServiceStub {
  private readonly _selectedLanguageId = signal<LanguageId>(DEFAULT_LANGUAGE_ID);

  readonly selectedLanguageId$: Signal<LanguageId> = this._selectedLanguageId.asReadonly();
  readonly availableLanguages: ReadonlyArray<LanguageId> = AVAILABLE_LANGUAGE_IDS;

  setLanguage(langId: LanguageId): void {
    this._selectedLanguageId.set(langId);
  }

  getSelectedLanguageId(): LanguageId {
    return this._selectedLanguageId();
  }

  instant(key: TranslationKey | TranslationKey[], _params?: TranslateParams): string {
    const flat = Array.isArray(key) ? key.join(',') : key;
    return TESTING_TRANSLATE_PREFIX + flat;
  }

  selectTranslate(key: TranslationKey, _params?: TranslateParams): Observable<string> {
    return of(TESTING_TRANSLATE_PREFIX + key);
  }

  instantUnchecked(value: string, _params?: TranslateParams): string {
    return TESTING_TRANSLATE_PREFIX + value;
  }
}
