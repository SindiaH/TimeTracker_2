import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';
import { LANGUAGE_IDS } from '@core/constants/language.constants';
import { LOCAL_STORAGE_KEYS } from '@core/constants/storage-keys';
import { TranslationService } from '@core/i18n/translation.service';

const translocoTestingOptions: TranslocoTestingOptions = {
  langs: {
    'en-US': { hello: 'hello' },
    'de-AT': { hello: 'hallo' },
  },
  translocoConfig: {
    availableLangs: [LANGUAGE_IDS.enUs, LANGUAGE_IDS.deAt],
    defaultLang: LANGUAGE_IDS.enUs,
  },
};

describe('TranslationService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [TranslocoTestingModule.forRoot(translocoTestingOptions)],
      providers: [TranslationService],
    });
  });

  it('defaults to en-US when localStorage is empty', () => {
    const service = TestBed.inject(TranslationService);

    expect(service.getSelectedLanguageId()).toBe(LANGUAGE_IDS.enUs);
  });

  it('reads persisted language from localStorage', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.language, LANGUAGE_IDS.deAt);

    const service = TestBed.inject(TranslationService);

    expect(service.getSelectedLanguageId()).toBe(LANGUAGE_IDS.deAt);
  });

  it('falls back to default when persisted value is invalid', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.language, 'fr-FR');

    const service = TestBed.inject(TranslationService);

    expect(service.getSelectedLanguageId()).toBe(LANGUAGE_IDS.enUs);
  });

  it('setLanguage updates the signal and persists to localStorage', () => {
    const service = TestBed.inject(TranslationService);

    service.setLanguage(LANGUAGE_IDS.deAt);
    TestBed.tick();

    expect(service.getSelectedLanguageId()).toBe(LANGUAGE_IDS.deAt);
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.language)).toBe(LANGUAGE_IDS.deAt);
  });

  it('setLanguage updates documentElement.lang', () => {
    const service = TestBed.inject(TranslationService);

    service.setLanguage(LANGUAGE_IDS.deAt);
    TestBed.tick();

    expect(document.documentElement.lang).toBe(LANGUAGE_IDS.deAt);
  });

  it('setLanguage rejects unknown language ids', () => {
    const service = TestBed.inject(TranslationService);

    service.setLanguage('fr-FR' as never);

    expect(service.getSelectedLanguageId()).toBe(LANGUAGE_IDS.enUs);
  });
});
