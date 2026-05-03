import { ChangeDetectorRef, inject, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationKey } from '@core/constants/translation-keys';
import { TranslationService } from '@core/i18n/translation.service';

type TranslateParams = Record<string, unknown>;

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true,
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);

  private subscription: Subscription | null = null;
  private lastKey: TranslationKey | null = null;
  private lastParamsHash: string | null = null;
  private lastValue: string = '';

  transform(key: TranslationKey | null | undefined, params?: TranslateParams): string {
    if (!key) {
      return '';
    }

    const paramsHash = this.hashParams(params);
    if (key !== this.lastKey || paramsHash !== this.lastParamsHash) {
      this.lastKey = key;
      this.lastParamsHash = paramsHash;
      this.subscription?.unsubscribe();
      this.subscription = this.translationService.selectTranslate(key, params).subscribe((value: string) => {
        this.lastValue = value;
        this.cdr.markForCheck();
      });
    }

    return this.lastValue;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private hashParams(params: TranslateParams | undefined): string {
    return params ? JSON.stringify(params) : '';
  }
}
