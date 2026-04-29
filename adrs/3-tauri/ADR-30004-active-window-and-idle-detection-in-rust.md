# Active Window and Idle Detection in Rust

- **Status:** accepted
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The core feature of TimeTracker is recording which application — and, for browsers, which URL — is in the foreground over time, plus how long the user has been idle. The previous Electron version implements this in three layers:

1. **macOS active window**: a Swift binary `app/helpers/MacUtilities/main` (with a separate `main_x64` for Intel) called via `child_process.execFile` from `MacHelper.ts`. The binary returns JSON matching `ActiveWinType`.
2. **Windows / Linux active window**: the Node module `@evgenys91/active-win`, which itself spawns a native helper.
3. **Browser URL on Windows**: the binary `app/helpers/WinUtilities/GetBrowserUrl.exe`, called via `WindowsUrlHelper.ts` only when the active process name contains `chrome`, `firefox`, or `edge`.
4. **Idle time**: Electron `powerMonitor.getSystemIdleTime()`, returning seconds.

In Tauri the renderer cannot spawn child processes (ADR-30002). The detection logic must therefore live in Rust, exposed via the commands defined in ADR-30003.

## Decision

Active-window and idle-time detection are implemented as Rust functions in `src-tauri/src/activity` and `src-tauri/src/idle`, exposed via the commands `activity_get_active_window`, `idle_get_system_idle_time`, and `system_get_hostname`.

### Active window

`activity::get_active_window()` returns the same shape the previous project returned, so the Angular `ActivityInfoEntity.mapWindowActivityToInfo` mapper can be reused unchanged:

```rust
// src-tauri/src/contract.rs
#[derive(Serialize, Deserialize)]
pub struct ActiveWindowInfo {
    pub title: String,
    pub id: i64,
    pub bounds: Bounds,
    pub owner: Owner,
    pub url: String,
    pub memory_usage: u64,
    pub platform: Platform, // "macos" | "win32" | "linux"
}
```

Implementation strategy per platform:

| Platform | Window metadata                                          | Browser URL (Chrome / Firefox / Edge)                                  |
|----------|----------------------------------------------------------|------------------------------------------------------------------------|
| macOS    | `MacUtilities/main` sidecar (re-used as-is, ADR-30005)   | included in the sidecar's JSON (AppleEvents, see ADR-30005)             |
| Windows  | `active-win-pos-rs` crate (Win32 `GetForegroundWindow` + `GetWindowThreadProcessId`) | `WinUtilities/GetBrowserUrl.exe` sidecar (re-used as-is, ADR-30005)    |
| Linux    | `active-win-pos-rs` crate (X11 / Wayland)                | empty string (parity with old project — Linux URL was never supported) |

The macOS path delegates to the sidecar so the existing AppleScript / Accessibility implementation does not need to be ported. The Windows path uses a pure-Rust crate for window metadata and only invokes the sidecar when the foreground process name matches the browser allow-list — same condition as the old project.

### Idle time

`idle::get_system_idle_time()` returns seconds as `u64`:

| Platform | Implementation                                                                  |
|----------|----------------------------------------------------------------------------------|
| macOS    | `CGEventSourceSecondsSinceLastEventType(kCGEventSourceStateHIDSystemState, kCGAnyInputEventType)` via the `core-graphics` crate |
| Windows  | `GetLastInputInfo` (Win32) via the `windows` crate                              |
| Linux    | `xidle` (X11) / `idle_inhibit` fallback via the `user-idle` crate                |

The result must be a non-negative integer of seconds — identical to the contract `powerMonitor.getSystemIdleTime()` exposed in the old project.

### Hostname

`system::get_hostname()` wraps `gethostname::gethostname()`. Replaces `os.hostname()` calls in the old `ElectronService`.

### Polling cadence

Polling cadence is a frontend concern (the existing `TimeTrackingService` decides how often to call). The Rust commands are stateless and cheap (a single FFI call on Windows/Linux, a sub-100 ms sidecar invocation on macOS), so a 1 s polling interval — the cadence used by the old project — is acceptable.

### Permissions

- macOS requires Accessibility permission (for foreground window) and AppleEvents permission (for browser URL via the sidecar). The `Info.plist` continues to declare `NSAppleEventsUsageDescription` (ADR-30007).
- Windows: no special permissions for foreground window or idle. The sidecar runs in the user context.
- Linux: no special permissions on X11; Wayland may not expose foreground-window info — the command returns `None` and the renderer treats that as "no activity recorded".

## Consequences

- **Functional parity**: The shape of `ActiveWindowInfo` and the seconds-based idle contract match the old project exactly, so the Angular `ActivityProvider` and `TimeTrackingService` need no semantic changes — only the `ElectronService` is replaced by `DesktopService` (ADR-30008).
- **Re-uses existing native binaries**: The macOS Swift helper and the Windows `GetBrowserUrl.exe` are kept as sidecars (ADR-30005). No platform-specific code is rewritten; the Rust layer is glue.
- **Pure Rust on Windows / Linux for window metadata**: Drops the `@evgenys91/active-win` Node dependency. The `active-win-pos-rs` crate provides equivalent metadata without spawning a Node helper.
- **Async commands**: All three commands are `async`. macOS sidecar latency does not block the Tauri event loop.
- **Wayland gap remains**: Wayland's security model intentionally hides foreground-window info from unprivileged clients. This is the same gap Electron has and is not introduced by the rebuild.
- **Testable in isolation**: Each function is a plain Rust function — unit tests can mock the platform layer and exercise the JSON contract without booting Tauri.

## Alternatives Considered

- **Re-use `@evgenys91/active-win` via Node.js sidecar**: Bundle Node and the module as a sidecar. Rejected because it ships a full Node runtime (~50 MB) just to call one function that has a native Rust equivalent.
- **Replace the macOS Swift sidecar with a Rust implementation**: `active-win-pos-rs` works on macOS, but extracting the URL from Safari/Chrome/Firefox/Edge requires AppleEvents, which is exactly what the existing Swift helper already does. Rejected as a rewrite of working code; the sidecar path preserves URL extraction at zero engineering cost.
- **Replace `WinUtilities/GetBrowserUrl.exe` with UI Automation in Rust**: Possible (`windows::Win32::UI::Accessibility`), but the existing binary is battle-tested across Chrome/Firefox/Edge and version updates. Rejected for the rebuild; revisit if the sidecar becomes a maintenance burden.
- **Subscribe to OS focus-change events instead of polling**: macOS `NSWorkspace` notifications and Windows `SetWinEventHook` would push instead of poll. Considered but deferred — the current polling cadence is what the Angular layer expects, and switching to push semantics is an independent improvement that can supersede this ADR later.
