# Tauri Command and Event IPC Pattern

- **Status:** approved
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

With the capability-based security model (ADR-30002), all communication between the Angular renderer and the Rust core goes through Tauri's IPC bridge. The previous TimeTracker version uses a flat set of Electron `ipcMain.handle` strings (`getSystemIdleTime`, `getActiveWin`, `get-config`, `save-config`, `openSqlLiteLocation`) registered in `IPCHelper`. The rebuild needs a structured pattern that is type-safe, namespaced, and auditable.

Tauri offers two primitives:

- **Commands** — request/response, declared in Rust as `#[tauri::command]` and called from JS via `invoke('cmd_name', args)`. Returns a Promise.
- **Events** — pub/sub, emitted from Rust via `app_handle.emit("channel", payload)` and listened in JS via `listen('channel', cb)`. Used for unsolicited messages (deep-link arrival, tray actions).

This ADR fixes the conventions for both.

## Decision

### 1. Naming convention

Commands use `snake_case` with a domain prefix (Rust convention, mapped 1:1 to JS):

| Domain      | Commands                                                                                       |
|-------------|------------------------------------------------------------------------------------------------|
| `activity`  | `activity_get_active_window`                                                                   |
| `idle`      | `idle_get_system_idle_time`                                                                    |
| `system`    | `system_get_hostname`                                                                          |
| `config`    | (delegated to `tauri-plugin-store`, see ADR-30006)                                             |
| `dialog`    | (delegated to `tauri-plugin-dialog`, see ADR-30007)                                            |

Events use `kebab-case` with a domain prefix:

| Domain      | Events                                                                                         |
|-------------|------------------------------------------------------------------------------------------------|
| `app`       | `app:deep-link` (emitted with the parsed `timesapp://` URL)                                    |
| `app`       | `app:second-instance` (emitted by `tauri-plugin-single-instance` with the new instance argv)    |
| `tray`      | `tray:menu-action` (reserved for future tray menu items)                                       |

### 2. Request/response via commands

All renderer-to-core operations that expect a result use commands:

```rust
// src-tauri/src/commands/activity.rs
#[tauri::command]
pub async fn activity_get_active_window() -> Result<Option<ActiveWindowInfo>, String> {
    crate::activity::get_active_window().await.map_err(|e| e.to_string())
}
```

```typescript
// src/app/core/services/desktop/desktop.service.ts (see ADR-30008)
const info = await invoke<ActiveWindowInfo | null>('activity_get_active_window');
```

Commands return `Result<T, String>` on the Rust side; rejections surface as Promise rejections in TypeScript with the error string preserved.

### 3. Core-to-renderer events

Unsolicited messages from the core use events. Subscriptions are scoped with `unlisten` to avoid leaks:

```rust
// On macOS open-url / Windows second-instance argv
app_handle.emit("app:deep-link", parsed_url)?;
```

```typescript
const unlisten = await listen<string>('app:deep-link', (e) => router.handleDeepLink(e.payload));
// later
unlisten();
```

The `DesktopService` (ADR-30008) wraps `listen` in an RxJS `Observable` so consumers get automatic teardown via Angular's `takeUntilDestroyed`.

### 4. Type-safe contract

A single shared TypeScript file declares the IPC surface. It is the source of truth that both the Angular service and the Rust commands must match:

```typescript
// src/app/shared/desktop/ipc-contract.ts
export interface ActiveWindowInfo {
  title: string;
  id: number;
  bounds: { x: number; y: number; width: number; height: number };
  owner: { name: string; processId: number; bundleId: string; path: string };
  url: string;
  memoryUsage: number;
  platform: 'macos' | 'win32' | 'linux';
}

export interface DesktopCommands {
  activity_get_active_window: { args: void; result: ActiveWindowInfo | null };
  idle_get_system_idle_time:  { args: void; result: number };
  system_get_hostname:        { args: void; result: string };
}

export interface DesktopEvents {
  'app:deep-link':       string;
  'app:second-instance': { argv: string[]; cwd: string };
}
```

The Rust structs in `src-tauri/src/contract.rs` mirror this contract field-for-field. A CI step (`cargo test --test contract_parity`) deserializes a sample JSON of each TypeScript type into the corresponding Rust struct to catch drift.

### 5. Centralized command registration

All commands are registered in one place in `src-tauri/src/main.rs`:

```rust
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        commands::activity::activity_get_active_window,
        commands::idle::idle_get_system_idle_time,
        commands::system::system_get_hostname,
    ])
    .plugin(tauri_plugin_store::Builder::default().build())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .plugin(tauri_plugin_deep_link::init())
    .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
        let _ = app.emit("app:second-instance", SecondInstancePayload { argv, cwd });
    }))
    .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
    .run(tauri::generate_context!())
```

This block, together with the capability file (ADR-30002), forms the complete IPC surface. A reviewer can audit it in two files.

## Consequences

- **Type-safe IPC**: The shared contract file plus the Rust struct mirror prevent silent drift between renderer and core.
- **Auditable**: The capability file (ADR-30002) plus the `invoke_handler!` block plus `ipc-contract.ts` together enumerate every legal IPC interaction.
- **Promise semantics**: Errors propagate as rejected Promises; consumers use standard `try/catch` or RxJS `catchError`.
- **Three places to touch when adding a command**: Rust handler, `invoke_handler!` registration, and the contract file. The capability file usually requires an additional entry under `allow-activity-commands`.
- **Events require explicit teardown**: The `DesktopService` (ADR-30008) is responsible for wrapping `listen` so consumers cannot leak subscriptions.
- **Sidecar invocations are commands too**: The shell-sidecar wrapper for `MacUtilities/main` and `WinUtilities/GetBrowserUrl.exe` is exposed as a Rust function called from `activity_get_active_window`, never directly as a JS-callable shell command (ADR-30005).

## Alternatives Considered

- **Flat command names (`getActiveWin`, `getConfig`)**: 1:1 with the old project. Rejected because the namespace prefix scales as the IPC surface grows; `activity_*` and `idle_*` are immediately greppable.
- **`send`/`listen` only (no commands)**: Possible in Tauri but requires manual request/response correlation. Rejected because `invoke` already provides Promise-based round-trips.
- **Auto-generated bindings from Rust (`tauri-specta` / `ts-rs`)**: Considered. Useful but adds a build-time codegen step and a binding-publication workflow. The hand-written contract file plus a single `cargo test` parity check is judged sufficient at the current scale; the codegen path remains an option if the surface grows.
- **One channel per capability**: Considered the inverse — register only one `dispatch` command and switch on a payload tag. Rejected because it defeats the capability allow-list (one capability would unlock everything) and obscures the audit trail.
