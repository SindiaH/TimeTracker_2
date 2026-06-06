import { Injectable, Signal, signal } from '@angular/core';
import { ServiceBase } from '@core/base/service-base';

@Injectable()
export class TreeDropConnectionService extends ServiceBase {
  private readonly _ids = signal<readonly string[]>([]);
  readonly ids: Signal<readonly string[]> = this._ids.asReadonly();

  register(id: string): void {
    this._ids.update((arr) => (arr.includes(id) ? arr : [...arr, id]));
  }

  unregister(id: string): void {
    this._ids.update((arr) => arr.filter((x) => x !== id));
  }
}
