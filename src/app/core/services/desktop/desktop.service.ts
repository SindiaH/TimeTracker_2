import { Injectable } from '@angular/core';
import { EMPTY, Observable, share } from 'rxjs';
import { ServiceBase } from '@core/base/service-base';
import { DESKTOP_COMMANDS, DESKTOP_EVENTS } from '@core/constants/desktop-ipc';
import { SQLITE_DATABASE_FILENAME, TAURI_STORE_FILES, TAURI_STORE_KEYS } from '@core/constants/storage-keys';
import { ActiveWindowInfo, SecondInstancePayload } from '@shared/desktop/ipc-contract';
import { defaultDesktopConfig, IDesktopConfig } from '@shared/desktop/desktop-config';

type TauriGlobals = { __TAURI_INTERNALS__?: unknown };

@Injectable({ providedIn: 'root' })
export class DesktopService extends ServiceBase {
  readonly isDesktop: boolean = typeof (globalThis as TauriGlobals).__TAURI_INTERNALS__ !== 'undefined';

  readonly deepLink$: Observable<string> = this.isDesktop
    ? this.createEvent$<string>(DESKTOP_EVENTS.appDeepLink)
    : EMPTY;

  readonly secondInstance$: Observable<SecondInstancePayload> = this.isDesktop
    ? this.createEvent$<SecondInstancePayload>(DESKTOP_EVENTS.appSecondInstance)
    : EMPTY;

  async getHostname(): Promise<string | null> {
    if (!this.isDesktop) return null;
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<string>(DESKTOP_COMMANDS.systemGetHostname);
  }

  async getCurrentActiveWindow(): Promise<ActiveWindowInfo | null> {
    if (!this.isDesktop) return null;
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<ActiveWindowInfo | null>(DESKTOP_COMMANDS.activityGetActiveWindow);
  }

  async getIdleSeconds(): Promise<number | null> {
    if (!this.isDesktop) return null;
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<number>(DESKTOP_COMMANDS.idleGetSystemIdleTime);
  }

  async getDesktopConfig(): Promise<IDesktopConfig | null> {
    if (!this.isDesktop) return null;
    const { Store } = await import('@tauri-apps/plugin-store');
    const store = await Store.load(TAURI_STORE_FILES.appSettings);
    const value = await store.get<IDesktopConfig>(TAURI_STORE_KEYS.appSettings);
    return value ?? { ...defaultDesktopConfig };
  }

  async saveDesktopConfig(config: IDesktopConfig): Promise<void> {
    if (!this.isDesktop) return;
    const { Store } = await import('@tauri-apps/plugin-store');
    const store = await Store.load(TAURI_STORE_FILES.appSettings);
    await store.set(TAURI_STORE_KEYS.appSettings, config);
    await store.save();
  }

  async getSqliteFolder(): Promise<string | null> {
    if (!this.isDesktop) return null;
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected !== 'string') return null;
    return this.normaliseSqliteFolder(selected);
  }

  private normaliseSqliteFolder(path: string): string {
    const trimmed = path.replace(/[/\\]+$/, '');
    if (trimmed.toLowerCase().endsWith(SQLITE_DATABASE_FILENAME)) {
      return trimmed;
    }
    const separator = trimmed.includes('\\') ? '\\' : '/';
    return `${trimmed}${separator}${SQLITE_DATABASE_FILENAME}`;
  }

  private createEvent$<T>(channel: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      let unlisten: (() => void) | undefined;
      let cancelled = false;

      import('@tauri-apps/api/event')
        .then(({ listen }) => listen<T>(channel, (event) => subscriber.next(event.payload)))
        .then((fn) => {
          if (cancelled) {
            fn();
            return;
          }
          unlisten = fn;
        })
        .catch((error) => subscriber.error(error));

      return () => {
        cancelled = true;
        unlisten?.();
      };
    }).pipe(share());
  }
}
