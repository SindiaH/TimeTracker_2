import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map, startWith, switchMap } from 'rxjs';

export function controlErrorKeys(controlSignal: Signal<AbstractControl>): Signal<ReadonlySet<string>> {
  const initial: ReadonlySet<string> = new Set<string>();
  return toSignal(
    toObservable(controlSignal).pipe(
      switchMap((control) =>
        control.events.pipe(
          startWith(null),
          map((): ReadonlySet<string> => new Set<string>(Object.keys(control.errors ?? {}))),
        ),
      ),
    ),
    { initialValue: initial },
  );
}
