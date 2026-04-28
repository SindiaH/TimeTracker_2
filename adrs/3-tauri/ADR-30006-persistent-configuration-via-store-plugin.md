# Persistent Configuration via tauri-plugin-store

- **Status:** proposed
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The previous TimeTracker version persists desktop configuration in a JSON file at `<userData>/appSettings.json`, read and written from `app/utilities/ManageElectronConfig.ts`. The shape (`IElectronConfig`) is shared between the Angular bundle and the Electron main process via `src/app/shared/electron/ElectronConfig.ts`, copied to `app/shared/` by the prestart script.

The fields are:

```typescript
type IElectronConfig = {
  version: string;
  autoTracking: { autoStartTracking: boolean };
  windowPosition: { width: number; height: number; x: number; y: number };
  windowOptions: { zoom: number };
  sqlLiteConfig: { folder: string };
  syncConfig: {
    activitiesSyncType: 'sqllite' | 'supabase';
    tasksSyncType: 'sqllite' | 'supabase';
  };
};
```

Two read/write commands are exposed (`get-config` and `save-config`). The renderer caches the config on startup and writes back on settings changes; the main process also writes to it on window close (to persist `windowPosition` and `zoom`).

In TimeTracker_2 the persistence layer must remain functionally identical, but should not require hand-rolled file I/O code. Tauri provides `tauri-plugin-store`, a key/value store with disk persistence in the platform's standard config directory.

## Decision

Desktop configuration is persisted via **`tauri-plugin-store`** under the key `app-settings` in a single store file `appSettings.json`, located in the OS-standard config directory (the same path Tauri returns for `app_config_dir()`).

### Store registration

```rust
// src-tauri/src/main.rs
.plugin(
    tauri_plugin_store::Builder::default()
        .default(StoreBuilder::new("appSettings.json")
            .default("app-settings", default_app_settings_json())
            .build())
        .build()
)
```

`default_app_settings_json()` returns the same defaults as the previous `DefaultConfig` constant — no semantic change.

### Migration of fields

The `IElectronConfig` shape is preserved verbatim except for two changes that decouple from Electron:

| Old field                    | New field                | Reason                                                              |
|------------------------------|--------------------------|---------------------------------------------------------------------|
| `windowPosition` (Rectangle) | *(removed)*              | Window bounds move to `tauri-plugin-window-state` (ADR-30007)       |
| `windowOptions.zoom`         | `windowOptions.zoom`     | Kept; zoom is not handled by the window-state plugin                |
| all other fields             | unchanged                | Renamed type → `IDesktopConfig`, otherwise field-for-field identical |

The shared TypeScript file is renamed `src/app/shared/desktop/desktop-config.ts` (was `src/app/shared/electron/ElectronConfig.ts`) and is re-imported from Angular only — no copy step is needed because the Rust side does not care about the shape (the store plugin treats values as opaque JSON).

### Renderer access

The Angular `DesktopService` (ADR-30008) reads and writes via the plugin's JS bindings:

```typescript
import { Store } from '@tauri-apps/plugin-store';

const store = await Store.load('appSettings.json');
const config = (await store.get<IDesktopConfig>('app-settings')) ?? defaultConfig;
await store.set('app-settings', updatedConfig);
await store.save();
```

`store.save()` is called explicitly so writes are durable; the plugin debounces multiple `set` calls into one disk write.

### Write triggers

| Event                                            | Old project                                                        | New project                                                              |
|--------------------------------------------------|--------------------------------------------------------------------|--------------------------------------------------------------------------|
| User changes `autoStartTracking` in settings UI  | Angular calls `saveConfig` IPC                                     | Angular calls `store.set('app-settings', ...)` then `store.save()`       |
| User changes `sqlLiteConfig.folder`              | Same                                                               | Same                                                                     |
| Window bounds change (move/resize/close)         | Electron `win.on('close')` writes via `SaveWindowBondsAndOptions`  | `tauri-plugin-window-state` handles bounds (ADR-30007); zoom written by Angular before unload |

### Migration from legacy install

The new app keeps the legacy bundle identifier (`com.electron.timetrack`) and product name (`TimeTrack`, see ADR-30007). It is therefore installed by the OS into the same per-user data directory the legacy Electron app used. A first-run hook in `src-tauri/src/migration.rs` runs in the `tauri::Builder::setup` callback **before** the main window is shown:

1. **Locate the legacy file** at the OS-specific path that Electron's `app.getPath('userData')` resolves to for `productName = "TimeTrack"`:
   - macOS: `~/Library/Application Support/TimeTrack/appSettings.json`
   - Windows: `%APPDATA%\TimeTrack\appSettings.json`
   - Linux: `~/.config/TimeTrack/appSettings.json`
2. **Idempotency**: if the file is missing, or a sibling marker `appSettings.json.bak` already exists, the hook is a no-op. Migration runs at most once per user.
3. **Parse and validate** the JSON against the `IDesktopConfig` schema (required fields: `version`, `autoTracking`, `windowOptions`, `sqlLiteConfig`, `syncConfig`). The legacy `windowPosition` field is intentionally ignored — window bounds are now owned by `tauri-plugin-window-state` (ADR-30007), so this state intentionally does not migrate.
4. **Write** the parsed values into the new `tauri-plugin-store` (file `appSettings.json` in the Tauri `app_config_dir`). `sqlLiteConfig.folder` is preserved verbatim — the SQLite database file itself is **not** moved, since the user picked that location deliberately.
5. **Backup the legacy file** by renaming it to `appSettings.json.bak` (atomic `rename`). This both proves the migration ran (idempotency marker) and gives the user a rescue copy if the new store needs hand-inspection.
6. **Log** every step via `tauri-plugin-log` so a migration is reproducible from the support logs.

Failure mode: if read or parse fails, the migration is aborted, the legacy file is left untouched, and the new store initializes with `default_app_settings_json()`. The user sees defaults on first launch and the legacy file remains available for manual recovery.

## Consequences

- **Drops hand-rolled file I/O**: `ManageElectronConfig.ts` and `GetSettingsPath.ts` are no longer needed. Disk format and atomicity (debounced write, atomic rename) are handled by the plugin.
- **Same field set, same defaults**: Existing Angular code that consumes `IElectronConfig` (renamed `IDesktopConfig`) keeps working with a one-line import change. `syncConfig.activitiesSyncType` / `tasksSyncType` (`'sqllite' | 'supabase'`) values are preserved exactly.
- **Auto-start tracking flag**: The Angular bootstrap continues to read `autoTracking.autoStartTracking` and start the tracker if `true` — unchanged behavior, just sourced from the store.
- **Path change is silent**: The store may live in a different directory than `<old userData>/appSettings.json`. The first-run migration handles this transparently for existing installs.
- **Window bounds split**: Bounds and zoom were a single struct; bounds now live in the window-state plugin's own file (ADR-30007). The conceptual coupling is broken cleanly.
- **No native code for config**: Adding a field is a TypeScript-only change — bumping the schema version, extending `IDesktopConfig`, and adding a default. Rust is not involved.

## Alternatives Considered

- **Hand-rolled JSON in `app_config_dir()`**: Possible — call `fs::read`/`fs::write` from Rust commands. Rejected because it reproduces the exact same code that the store plugin already provides, with worse atomicity guarantees.
- **SQLite for config**: Overkill for ~10 keys, and would conflict with the user's `sqlLiteConfig.folder` (the SQLite *database* lives in a user-chosen folder, the *config* should not). Rejected.
- **OS keychain (Stronghold / Keytar)**: Considered for sensitive values, but none of the current config fields are secrets. Auth tokens go through Supabase's session storage (ADR-10013), not this store. Rejected as unnecessary complexity.
- **Single-file split per concern (autoTracking.json, sqliteConfig.json, etc.)**: Rejected — the old project shipped one file and consumers are written assuming one round-trip read; splitting would multiply the I/O for no benefit.
