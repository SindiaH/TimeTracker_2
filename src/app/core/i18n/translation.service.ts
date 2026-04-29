import { DOCUMENT, registerLocaleData } from '@angular/common';
import deAT from '@angular/common/locales/de-AT';
import enUS from '@angular/common/locales/en';
import { effect, inject, Injectable, Signal, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

type TranslateParams = Record<string, unknown>;
import { Observable } from 'rxjs';
import { ServiceBase } from '@core/base/service-base';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  LanguageId,
  Locale,
} from '@core/i18n/translation.types';

@Injectable({ providedIn: 'root' })
export class TranslationService extends ServiceBase {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);

  private readonly _selectedLanguageId = signal<LanguageId>(this.readPersistedLanguage());

  readonly selectedLanguageId$: Signal<LanguageId> = this._selectedLanguageId.asReadonly();
  readonly availableLanguages: ReadonlyArray<LanguageId> = AVAILABLE_LANGUAGES;

  constructor() {
    super();

    this.registerAngularLocaleData();
    this.transloco.setAvailableLangs([...AVAILABLE_LANGUAGES]);
    this.transloco.setDefaultLang(DEFAULT_LANGUAGE);
    this.transloco.setActiveLang(this._selectedLanguageId());

    effect(() => {
      const langId = this._selectedLanguageId();
      this.transloco.setActiveLang(langId);
      this.persistLanguage(langId);
      this.document.documentElement.lang = langId;
    });
  }

  setLanguage(langId: LanguageId): void {
    if (this.isAvailableLanguage(langId)) {
      this._selectedLanguageId.set(langId);
    }
  }

  getSelectedLanguageId(): LanguageId {
    return this._selectedLanguageId();
  }

  loadTranslations(...locales: Locale[]): void {
    for (const locale of locales) {
      this.transloco.setTranslation(locale.data, locale.langId, { merge: true });
    }
  }

  instant(key: string | string[], params?: TranslateParams): string {
    return this.transloco.translate<string>(key, params);
  }

  selectTranslate(key: string, params?: TranslateParams): Observable<string> {
    return this.transloco.selectTranslate<string>(key, params);
  }

  private isAvailableLanguage(value: string): value is LanguageId {
    return (AVAILABLE_LANGUAGES as ReadonlyArray<string>).includes(value);
  }

  private registerAngularLocaleData(): void {
    registerLocaleData(enUS, 'en-US');
    registerLocaleData(deAT, 'de-AT');
  }

  private readPersistedLanguage(): LanguageId {
    const storage = this.document.defaultView?.localStorage;
    const stored = storage?.getItem(LANGUAGE_STORAGE_KEY);

    if (stored !== null && stored !== undefined && this.isAvailableLanguage(stored)) {
      return stored;
    }

    return DEFAULT_LANGUAGE;
  }

  private persistLanguage(langId: LanguageId): void {
    const storage = this.document.defaultView?.localStorage;
    storage?.setItem(LANGUAGE_STORAGE_KEY, langId);
  }
}
