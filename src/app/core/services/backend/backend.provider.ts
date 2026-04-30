import { Injectable, Signal, signal } from '@angular/core';
import { ServiceBase } from '@core/base/service-base';
import {
  AuthBackend,
  DataBackend,
  DEFAULT_AUTH_BACKEND,
  DEFAULT_DATA_BACKEND,
} from '@core/constants/backend.constants';

@Injectable({ providedIn: 'root' })
export class BackendProvider extends ServiceBase {
  private readonly _authBackend = signal<AuthBackend>(DEFAULT_AUTH_BACKEND);
  private readonly _dataBackend = signal<DataBackend>(DEFAULT_DATA_BACKEND);

  readonly authBackend: Signal<AuthBackend> = this._authBackend.asReadonly();
  readonly dataBackend: Signal<DataBackend> = this._dataBackend.asReadonly();
}
