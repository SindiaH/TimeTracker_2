# Desktop Service Abstraction in Angular

- **Status:** approved
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The previous TimeTracker version exposes desktop functionality to Angular through a single `ElectronService` (`src/app/core/services/electron/electron.service.ts`). That service:

- detects whether it is running under Electron via `window.process.type`,
- assigns `window.require('electron').ipcRenderer`, `window.require('os')`, `window.require('fs')`, `window.require('child_process')` into instance fields,
- exposes typed methods (`getCurrentActiveWindow`, `getIdleTimes`, `getElectronConfig`, `saveElectronConfig`, `getSqlLiteFolder`, `getHostname`),
- returns `null` when not running under Electron, so the same Angular bundle can be served as a pure web app.

For TimeTracker_2 the service is replaced by an equivalent that targets Tauri (or no host at all, in the web build). The boundary stays where it is — every consumer in the Angular app continues to depend on a single injected service — but the implementation switches to Tauri's `invoke` and `listen` primitives (ADR-30003).

## Decision

A single Angular service `DesktopService` (provided in `root`) is the only Angular-side touch point for desktop features. It exposes the same surface as the old `ElectronService` plus an `Observable` for events.

### Host detection

```typescript
get isDesktop(): boolean {
  return typeof (globalThis as any).__TAURI_INTERNALS__ !== 'undefined';
}
```

The Angular bootstrap branches on `isDesktop`:

- `true` → desktop features available, `DesktopService` calls Tauri.
- `false` → web build, every method short-circuits to `Promise.resolve(null)` (or the equivalent fallback the consumer expects). The Angular UI hides desktop-only settings (e.g., the SQLite folder picker, the auto-start-tracking toggle).

### Method-by-method mapping from `ElectronService`

| Old method                                  | New method                                  | Implementation                                                                 |
|---------------------------------------------|---------------------------------------------|--------------------------------------------------------------------------------|
| `isElectron`                                | `isDesktop`                                 | `__TAURI_INTERNALS__` feature detection                                        |
| `getHostname()`                             | `getHostname()`                             | `invoke<string>('system_get_hostname')`                                        |
| `getIdleTimes()`                            | `getIdleTimes()`                            | `invoke<number>('idle_get_system_idle_time')` → wrapped in `SimpleIdleInfo`    |
| `getCurrentActiveWindow()`                  | `getCurrentActiveWindow()`                  | `invoke<ActiveWindowInfo \| null>('activity_get_active_window')` → mapped via `ActivityInfoEntity.mapWindowActivityToInfo` (unchanged from old project) |
| `getElectronConfig()`                       | `getDesktopConfig()`                        | `Store.load('appSettings.json').then(s => s.get<IDesktopConfig>('app-settings'))` |
| `saveElectronConfig(cfg)`                   | `saveDesktopConfig(cfg)`                    | `store.set('app-settings', cfg)` then `store.save()`                           |
| `getSqlLiteFolder()`                        | `getSqliteFolder()`                         | `open({ directory: true, multiple: false })` from `@tauri-apps/plugin-dialog` plus the same path-derivation logic the old method used (extension check, OS separator) |
| *(implicit deep-link via Electron `open-url`)* | `deepLink$: Observable<string>`         | `listen<string>('app:deep-link', …)` wrapped in a multicast `Observable`        |

The naming change `Electron* → Desktop*` is deliberate — the service no longer references the runtime in its API, so a future runtime swap (e.g., to a native shell) needs only an implementation change.

### Service skeleton

```typescript
@Injectable({ providedIn: 'root' })
export class DesktopService {
  readonly isDesktop = typeof (globalThis as any).__TAURI_INTERNALS__ !== 'undefined';

  readonly deepLink$ = this.isDesktop
    ? new Observable<string>(sub => {
        let unlisten: UnlistenFn | undefined;
        listen<string>('app:deep-link', e => sub.next(e.payload)).then(fn => unlisten = fn);
        return () => unlisten?.();
      }).pipe(share())
    : EMPTY;

  async getCurrentActiveWindow(): Promise<ActivityInfoEntity | null> {
    if (!this.isDesktop) return null;
    const info = await invoke<ActiveWindowInfo | null>('activity_get_active_window');
    return info ? ActivityInfoEntity.mapWindowActivityToInfo(info, await this.getHostname()) : null;
  }

  async getIdleTimes(): Promise<SimpleIdleInfo | null> {
    if (!this.isDesktop) return null;
    const seconds = await invoke<number>('idle_get_system_idle_time');
    return {
      hostname: await this.getHostname(),
      idleInSecs: seconds,
      captureDate: this.subtractSeconds(new Date(), seconds),
    };
  }

  async getDesktopConfig(): Promise<IDesktopConfig | null> {
    if (!this.isDesktop) return null;
    const store = await Store.load('appSettings.json');
    return (await store.get<IDesktopConfig>('app-settings')) ?? defaultDesktopConfig;
  }

  async saveDesktopConfig(cfg: IDesktopConfig): Promise<void> {
    if (!this.isDesktop) return;
    const store = await Store.load('appSettings.json');
    await store.set('app-settings', cfg);
    await store.save();
  }

  // …getHostname, getSqliteFolder…
}
```

### Web fallback semantics

In the web build (`isDesktop === false`):

- `getCurrentActiveWindow()` and `getIdleTimes()` return `null`. The `TimeTrackingService` already handles `null` by skipping the tick — same behavior the old project had when running in a browser tab.
- `getDesktopConfig()` returns `null`. The web build does not need persistent desktop config; the only field it cares about (`syncConfig`, see ADR-30006) defaults to `'supabase'` for both `activitiesSyncType` and `tasksSyncType` because the SQLite path is desktop-only.
- `getSqliteFolder()` returns `null`. The settings UI hides this row in web mode.
- `deepLink$` is `EMPTY`. The router never receives deep-link events in the browser.

### Subscription hygiene

`deepLink$` is multicast via `share()` so multiple subscribers don't each register their own `listen` handler. Subscribers use Angular's `takeUntilDestroyed()` to tear down on component destroy; the `share()` operator's reference-counted unsubscribe path eventually calls the `listen` plugin's `unlisten` function.

### Testing

The service is straightforward to mock — every method is a thin wrapper around `invoke` / plugin calls. Component tests provide a stub `DesktopService` with hard-coded return values. The contract-parity test in ADR-30003 keeps the runtime side honest.

## Consequences

- **Single boundary**: The rest of the Angular app does not import from `@tauri-apps/api` or `@tauri-apps/plugin-*`. Adding/changing a desktop feature touches `DesktopService` and one Rust command — nothing else.
- **Web/desktop parity at the call site**: Consumers do not branch on host; they call `await desktop.getCurrentActiveWindow()` and handle `null`. Same idiom as the old `ElectronService`.
- **Method renames are mechanical**: `getElectronConfig → getDesktopConfig`, etc. A one-time codemod across the Angular app handles the rename.
- **Deep links become an Observable**: This is a small upgrade over the old project, which had no first-class deep-link surface in Angular (the URL was parsed in Electron's `main.ts` and shoved into the URL fragment). Components can now subscribe declaratively.
- **Type-safety against the IPC contract**: The `invoke` calls use the typed contract from ADR-30003; misnamed channels are caught at compile time.
- **No `window.require` / Node modules in Angular**: The build no longer imports `electron`, `child_process`, `fs`, `os` types into the renderer bundle. The Angular `tsconfig` drops the `@types/node` dependency for the renderer build.

## Alternatives Considered

- **Expose Tauri primitives directly to consumers**: Skip the wrapper, let components call `invoke('idle_get_system_idle_time')` themselves. Rejected because it spreads the runtime dependency across the whole app and makes the web fallback every consumer's problem.
- **Two services (`ActivityService` + `ConfigService`)**: Splitting by domain would be cleaner in isolation, but the old project ships one service and the boundary it represents (web vs. desktop, not activity vs. config) is the dimension that actually changes. Rejected; revisit if `DesktopService` grows beyond ~15 methods.
- **Inject the runtime via DI tokens**: Provide a `DESKTOP_RUNTIME` token that supplies either a Tauri or no-op implementation, with `DesktopService` consuming it. Considered. Slightly cleaner for testing, but the same effect is achieved by the `isDesktop` branch and a stub service in tests. Rejected as over-engineering for the current surface.
