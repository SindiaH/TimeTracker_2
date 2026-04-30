import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { buildTranslationAssetUrl } from '@core/constants/i18n-paths';

@Injectable({ providedIn: 'root' })
export class TranslationLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(langPath: string): Observable<Translation> {
    return this.http.get<Translation>(buildTranslationAssetUrl(langPath));
  }
}
