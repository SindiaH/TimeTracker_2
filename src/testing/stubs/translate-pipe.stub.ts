import { Pipe, PipeTransform } from '@angular/core';
import { TranslationKey } from '@core/constants/translation-keys';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true,
})
export class TranslatePipeStub implements PipeTransform {
  transform(key: TranslationKey | null | undefined, _params?: Record<string, unknown>): string {
    return key ?? '';
  }
}
