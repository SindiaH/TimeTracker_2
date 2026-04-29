import { Injectable, Signal, signal } from '@angular/core';
import { ServiceBase } from '@core/base/service-base';
import { AuthBackend, DataBackend } from '@core/services/backend/backend.type';

@Injectable({ providedIn: 'root' })
export class BackendProvider extends ServiceBase {
  private readonly _authBackend = signal<AuthBackend>('supabase');
  private readonly _dataBackend = signal<DataBackend>('supabase');

  readonly authBackend: Signal<AuthBackend> = this._authBackend.asReadonly();
  readonly dataBackend: Signal<DataBackend> = this._dataBackend.asReadonly();
}
