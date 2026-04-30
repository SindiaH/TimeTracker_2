import { Injectable } from '@angular/core';
import { EMPTY, Observable, share } from 'rxjs';
import { ServiceBase } from '@core/base/service-base';
import { ActiveWindowInfo, SecondInstancePayload } from '@shared/desktop/ipc-contract';
import { defaultDesktopConfig, IDesktopConfig } from '@shared/desktop/desktop-config';

type TauriGlobals = { __TAURI_INTERNALS__?: unknown };

const STORE_FILE = 'appSettings.json';
const STORE_KEY = 'app-settings';

@Injectable({ providedIn: 'root' })
export class DesktopService extends ServiceBase {
  readonly isDesktop: boolean = typeof (globalThis as TauriGlobals).__TAURI_INTERNALS__ !== 'undefined';

  readonly deepLink$: Observable<string> = this.isDesktop ? this.createEvent$<string>('app:deep-link') : EMPTY;

  readonly secondInstance$: Observable<SecondInstancePayload> = this.isDesktop
    ? this.createEvent$<SecondInstancePayload>('app:second-instance')
    : EMPTY;

  async getHostname(): Promise<string | null> {
    if (!this.isDesktop) return null;
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<string>('system_get_hostname');
  }

  async getCurrentActiveWindow(): Promise<ActiveWindowInfo | null> {
    if (!this.isDesktop) return null;
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<ActiveWindowInfo | null>('activity_get_active_window');
  }

  async getIdleSeconds(): Promise<number | null> {
    if (!this.isDesktop) return null;
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<number>('idle_get_system_idle_time');
  }

  async getDesktopConfig(): Promise<IDesktopConfig | null> {
    if (!this.isDesktop) return null;
    const { Store } = await import('@tauri-apps/plugin-store');
    const store = await Store.load(STORE_FILE);
    const value = await store.get<IDesktopConfig>(STORE_KEY);
    return value ?? { ...defaultDesktopConfig };
  }

  async saveDesktopConfig(config: IDesktopConfig): Promise<void> {
    if (!this.isDesktop) return;
    const { Store } = await import('@tauri-apps/plugin-store');
    const store = await Store.load(STORE_FILE);
    await store.set(STORE_KEY, config);
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
    if (trimmed.toLowerCase().endsWith('database.sqlite')) {
      return trimmed;
    }
    const separator = trimmed.includes('\\') ? '\\' : '/';
    return `${trimmed}${separator}database.sqlite`;
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
