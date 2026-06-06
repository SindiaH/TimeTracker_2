import { DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MonoTypeOperatorFunction } from 'rxjs';
import { APP_ICONS } from '@core/constants/app-icons';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';

@Directive()
export abstract class ComponentBase {
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly icons = APP_ICONS;
  protected readonly translationKeys = TRANSLATION_KEYS;

  protected takeUntilDestroyed<T>(): MonoTypeOperatorFunction<T> {
    return takeUntilDestroyed<T>(this.destroyRef);
  }
}
