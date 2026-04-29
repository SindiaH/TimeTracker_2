import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { ServiceBase } from '@core/base/service-base';

type TauriGlobals = {
  __TAURI_INTERNALS__?: unknown;
};

@Injectable({ providedIn: 'root' })
export class DesktopService extends ServiceBase {
  readonly isDesktop: boolean = typeof (globalThis as TauriGlobals).__TAURI_INTERNALS__ !== 'undefined';

  readonly deepLink$: Observable<string> = EMPTY;
}
