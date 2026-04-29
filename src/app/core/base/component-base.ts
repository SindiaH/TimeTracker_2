import { DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MonoTypeOperatorFunction } from 'rxjs';

@Directive()
export abstract class ComponentBase {
  protected readonly destroyRef = inject(DestroyRef);

  protected takeUntilDestroyed<T>(): MonoTypeOperatorFunction<T> {
    return takeUntilDestroyed<T>(this.destroyRef);
  }
}
