import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MonoTypeOperatorFunction } from 'rxjs';

@Injectable()
export abstract class ServiceBase {
  protected readonly destroyRef = inject(DestroyRef);

  protected takeUntilDestroyed<T>(): MonoTypeOperatorFunction<T> {
    return takeUntilDestroyed<T>(this.destroyRef);
  }
}
