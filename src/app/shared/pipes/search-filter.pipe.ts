import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '@core/i18n/translation.service';

@Pipe({
  name: 'searchFilter',
  standalone: false,
  pure: false,
})
export class SearchFilterPipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(searchTerm: string | null | undefined, keywords: ReadonlyArray<string>): boolean {
    const term = searchTerm?.trim().toLowerCase();
    if (!term) {
      return true;
    }
    if (keywords.length === 0) {
      return false;
    }
    const haystack = keywords.map((keyword) => this.translationService.instant(keyword).toLowerCase());
    const terms = term.split(/\s+/);
    return terms.every((needle) => haystack.some((value) => value.includes(needle)));
  }
}
