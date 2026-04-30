import { DOCUMENT, registerLocaleData } from '@angular/common';
import deAT from '@angular/common/locales/de-AT';
import enUS from '@angular/common/locales/en';
import { effect, inject, Injectable, Signal, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { ServiceBase } from '@core/base/service-base';
import {
  AVAILABLE_LANGUAGE_IDS,
  DEFAULT_LANGUAGE_ID,
  LANGUAGE_IDS,
  LanguageId,
} from '@core/constants/language.constants';
import { LOCAL_STORAGE_KEYS } from '@core/constants/storage-keys';
import { Locale } from '@core/i18n/translation.types';

type TranslateParams = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class TranslationService extends ServiceBase {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);

  private readonly _selectedLanguageId = signal<LanguageId>(this.readPersistedLanguage());

  readonly selectedLanguageId$: Signal<LanguageId> = this._selectedLanguageId.asReadonly();
  readonly availableLanguages: ReadonlyArray<LanguageId> = AVAILABLE_LANGUAGE_IDS;

  constructor() {
    super();

    this.registerAngularLocaleData();
    this.transloco.setAvailableLangs([...AVAILABLE_LANGUAGE_IDS]);
    this.transloco.setDefaultLang(DEFAULT_LANGUAGE_ID);
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
    return (AVAILABLE_LANGUAGE_IDS as ReadonlyArray<string>).includes(value);
  }

  private registerAngularLocaleData(): void {
    registerLocaleData(enUS, LANGUAGE_IDS.enUs);
    registerLocaleData(deAT, LANGUAGE_IDS.deAt);
  }

  private readPersistedLanguage(): LanguageId {
    const storage = this.document.defaultView?.localStorage;
    const stored = storage?.getItem(LOCAL_STORAGE_KEYS.language);

    if (stored !== null && stored !== undefined && this.isAvailableLanguage(stored)) {
      return stored;
    }

    return DEFAULT_LANGUAGE_ID;
  }

  private persistLanguage(langId: LanguageId): void {
    const storage = this.document.defaultView?.localStorage;
    storage?.setItem(LOCAL_STORAGE_KEYS.language, langId);
  }
}
