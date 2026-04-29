# Tauri 2 as Desktop Runtime

- **Status:** approved
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The TimeTracker application requires desktop-specific capabilities that are not available in a browser: active window monitoring (title, owner, process path, browser URL), system idle detection, persistent configuration outside the web origin, window position/zoom persistence, deep linking via a custom protocol (`timesapp://`), system file dialogs, and auto-start of tracking on launch. The previous TimeTracker version implemented these on top of Electron 39 with native sidecar binaries (`MacUtilities/main` for macOS, `WinUtilities/GetBrowserUrl.exe` for Windows) and the `@evgenys91/active-win` Node module.

For TimeTracker_2 the runtime is being re-evaluated. The application size, memory footprint, and security posture of Electron are the main motivators for change. The Angular frontend (see ADR-10001) remains unchanged and must continue to run as a pure web application without the desktop layer.

## Decision

Tauri 2 is adopted as the desktop runtime instead of Electron. The desktop shell consists of a Rust-based core process and a system WebView (WKWebView on macOS, WebView2 on Windows, WebKitGTK on Linux) that renders the Angular SPA.

All desktop features of the previous TimeTracker version MUST be preserved:

| Old Electron feature                                | New Tauri equivalent                                                                                                  |
|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| `getActiveWin` IPC (macOS native binary + active-win) | Rust `#[tauri::command]` `activity_get_active_window` (see ADR-30004) backed by sidecars where needed (see ADR-30005) |
| `getSystemIdleTime` (`powerMonitor`)                | Rust `#[tauri::command]` `idle_get_system_idle_time` using `user-idle` crate (see ADR-30004)                          |
| `getConfig` / `saveConfig` JSON in `userData`       | `tauri-plugin-store` with `appSettings.json` (see ADR-30006)                                                          |
| `openSqlLiteLocation` `dialog.showOpenDialog`       | `tauri-plugin-dialog` (see ADR-30007)                                                                                 |
| Window bounds + zoom restore on launch              | `tauri-plugin-window-state` (see ADR-30007)                                                                           |
| `timesapp://` protocol (open-url / argv)            | `tauri-plugin-deep-link` (see ADR-30007)                                                                              |
| Single-instance behavior on Windows                 | `tauri-plugin-single-instance` (see ADR-30007)                                                                        |
| Auto-start tracking on launch                       | Config flag `autoTracking.autoStartTracking` consumed by Angular bootstrap (unchanged semantics)                      |
| `os.hostname()` from renderer                       | Rust `#[tauri::command]` `system_get_hostname` (see ADR-30004)                                                        |
| Web fallback (Angular runs without desktop layer)   | `DesktopService` feature-detects `window.__TAURI_INTERNALS__` (see ADR-30008)                                         |

Justification:

- **Footprint**: Tauri uses the system WebView, removing the bundled Chromium and reducing installer size from ~150 MB to ~10–20 MB and idle RSS from hundreds of MB to tens of MB.
- **Security posture**: Tauri's capability-based ACL (see ADR-30002) gives the renderer no ambient access to the OS by default, replacing the `nodeIntegration: true` / `contextIsolation: false` configuration of the previous project.
- **Native integration**: The active window and idle detection logic moves into Rust commands. Existing native helpers (`MacUtilities/main`, `WinUtilities/GetBrowserUrl.exe`) are re-used as Tauri sidecar binaries (see ADR-30005) so functional parity is preserved without rewriting platform-specific code that already works.
- **Plugin ecosystem**: First-party plugins exist for all required cross-cutting features (store, dialog, window-state, deep-link, single-instance, autostart, fs, os).
- **Web compatibility**: The Angular bundle is unchanged; the `DesktopService` (ADR-30008) abstracts the boundary so the same code runs in the browser without Tauri.

Target platforms remain macOS (universal x64 + arm64 `.dmg`/`.app`), Windows (NSIS installer, per-machine, allow-elevation), and Linux (AppImage).

## Consequences

- **Smaller bundle, lower memory**: The shipped desktop app drops from ~150 MB to ~15 MB and idle memory from ~250 MB to ~80 MB on a typical macOS install.
- **WebView differences**: macOS WKWebView, Windows WebView2, and Linux WebKitGTK have minor CSS/JS differences vs. Chromium. UI smoke-tests on all three platforms become mandatory before each release.
- **Rust toolchain becomes a build dependency**: `rustup`, `cargo`, and the platform's WebView SDK are required to build the desktop app. CI must install them; the web-only build is unaffected.
- **Native code lives in Rust**: New OS-level features must be added as Rust commands or plugins, not as Node modules. The team accepts a small Rust learning curve, reduced by the fact that the existing native binaries are re-used as sidecars.
- **No `electron-builder`**: Packaging moves to `tauri build` driven by `tauri.conf.json`. NSIS configuration (per-machine, allow-elevation) and macOS entitlements (AppleEvents for browser URL detection, hardened runtime) are migrated 1:1.
- **No `electron-reloader`**: Hot reload is provided by `tauri dev` pointing at the Angular dev server (`http://localhost:4200`). DevTools are available in dev builds via `--features devtools`.
- **Web build remains unchanged**: `npm run build` (Angular `web-production` configuration) continues to produce a deployable browser bundle without any Tauri code.

## Alternatives Considered

- **Stay on Electron 39**: Lowest migration cost, full Node.js available in the renderer with the existing IPC. Rejected because the previous project disables Context Isolation (`nodeIntegration: true`, `contextIsolation: false`), which is unacceptable for a rebuild, and because the bundle/memory cost is hard to justify for a tracker that should idle quietly in the background.
- **Neutralino / NW.js**: Smaller than Electron but still ship a runtime, weaker security model than Tauri, and a smaller plugin ecosystem. Rejected because they offer none of Electron's familiarity *and* none of Tauri's footprint advantage.
- **Progressive Web App (PWA)**: No installation required. Rejected because PWAs cannot read the active window, the focused process path, the browser URL outside the PWA's own tab, or the system idle time — these are the core TimeTracker features.
- **Native shell per platform (SwiftUI / WinUI)**: Best-in-class performance and integration. Rejected because it requires three independent UI codebases and discards the Angular investment.
