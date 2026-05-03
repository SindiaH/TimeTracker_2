import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable, of } from 'rxjs';
import { LANGUAGE_IDS } from '@core/constants/language.constants';
import { deAt } from '@core/i18n/locales/de-AT';
import { enUs } from '@core/i18n/locales/en-US';

@Injectable({ providedIn: 'root' })
export class TranslationLoader implements TranslocoLoader {
  getTranslation(langPath: string): Observable<Translation> {
    return of(langPath === LANGUAGE_IDS.deAt ? deAt : enUs);
  }
}
