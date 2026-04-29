import { computed, Injectable, Signal, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { ServiceBase } from '@core/base/service-base';
import { Session } from '@core/providers/session.type';

@Injectable({ providedIn: 'root' })
export class SessionProvider extends ServiceBase {
  private readonly _session = signal<Session | null>(null);
  private readonly _isLoading = signal<boolean>(false);

  readonly session: Signal<Session | null> = this._session.asReadonly();
  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();
  readonly isAuthenticated: Signal<boolean> = computed<boolean>(() => this._session() !== null);

  readonly session$: Observable<Session | null> = toObservable(this.session);
}
