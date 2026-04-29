# Platform Integration Plugins

- **Status:** approved
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

Beyond active-window / idle detection (ADR-30004) and config persistence (ADR-30006), the previous TimeTracker version relies on a number of cross-cutting Electron features:

- **Window bounds restore** — `app/utilities/WindowPositions.ts` reads/writes width/height/x/y on close, with screen-bounds validation (`screen.getDisplayMatching(...).workArea`) so a window saved on a now-disconnected monitor falls back into the visible area.
- **Deep linking via `timesapp://`** — `app.setAsDefaultProtocolClient('timesapp')`, with macOS `app.on('open-url', ...)` and Windows `process.argv` parsing in `main.ts`.
- **File/folder picker** — `dialog.showOpenDialog` for SQLite location selection (`openSqlLiteLocation` IPC).
- **Single-instance enforcement** — Implicit on macOS via the OS, but explicit handling is needed on Windows so a second `timesapp://` invocation focuses the existing window instead of launching a duplicate. (The old project did not handle this and is occasionally affected; the rebuild fixes it.)
- **Auto-start of tracking** — the `autoTracking.autoStartTracking` config flag is read by Angular at boot. (This is a *tracking* auto-start, not OS-level launch-at-login.)
- **macOS entitlements / Info.plist** — `NSAppleEventsUsageDescription` (browser URL via AppleScript), hardened runtime, JIT.
- **DevTools** in development.

This ADR collects the plugins and configuration that cover all of the above so each does not need its own ADR.

## Decision

The following first-party Tauri 2 plugins are adopted with the configuration listed:

### `tauri-plugin-window-state`

- Replaces `WindowPositions.ts`. Restores width/height/x/y/maximized on launch and persists them on close.
- Built-in screen-bounds validation: a window restored off-screen is moved into the primary monitor's work area — same fallback the old project implemented manually.
- The plugin's state file is separate from the store-plugin file (ADR-30006). Bounds and zoom are intentionally split: zoom remains in `IDesktopConfig.windowOptions.zoom` because it is a per-user preference, not a per-window-instance state.
- Configuration: state is restored automatically for the `main` window via `WindowExt::restore_state(StateFlags::all())` in the app setup hook.

### `tauri-plugin-deep-link`

- Registers `timesapp://` as the default protocol on all three platforms.
  - macOS: declared **in `Info.plist` under `CFBundleURLTypes`** (URL scheme = `timesapp`) **and** registered at runtime via the plugin. Both are required: the previous Electron project relied solely on runtime registration via `app.setAsDefaultProtocolClient('timesapp')`, but Tauri/macOS only routes deep links through `LSSetDefaultHandlerForURLScheme` reliably when the URL type is also declared in the bundle's `Info.plist`. Without the Plist entry the OS occasionally drops the `open-url` event under sandboxing.
  - Windows: registered in the registry at install time by the NSIS installer.
  - Linux: a `.desktop` MIME-type entry shipped with the AppImage.
- Incoming URLs are emitted on the `app:deep-link` event (ADR-30003). The Angular router subscribes via `DesktopService` (ADR-30008) and dispatches to the matching route (e.g., `timesapp://task/<id>`).
- The previous project's URL-fragment quirk (`url.replace('#', '?')` in `main.ts`) is preserved in the Rust handler for compatibility with existing share links.

### `tauri-plugin-single-instance`

- Ensures only one TimeTracker process is alive per user session.
- A second invocation (typically a deep link from a browser) emits `app:second-instance` with the new argv; the Rust handler parses any `timesapp://` URL out of argv and re-emits it as `app:deep-link`, then focuses the main window.
- Closes the gap the old Electron project had on Windows.

### `tauri-plugin-dialog`

- Replaces the `openSqlLiteLocation` IPC. The renderer calls `open({ directory: true, multiple: false })`, then derives the `database.sqlite` path the same way the old `ElectronService.getSqlLiteFolder()` does (extension check + separator handling).
- Used for any future export/import flows; no other dialog usage is currently planned.

### `tauri-plugin-autostart`

- **Optional**, used only if/when launch-at-login is added to the settings UI. Not required by the old project's feature set, but listed here so the capability is reserved in advance and the install-time registry entry on Windows can be planned for.
- Default state: disabled. The user must explicitly enable it from settings.

### `tauri-plugin-process` (devtools toggle)

- DevTools open automatically in `tauri dev` builds (debug profile only). Production builds compile without the `devtools` feature flag and DevTools cannot be opened.
- Replaces `electron-debug` and the `dom-ready → openDevTools` block in the old `main.ts`.

### `tauri.conf.json` bundle settings

```jsonc
{
  "productName": "TimeTrack",
  "bundle": {
    "active": true,
    "targets": ["nsis", "app", "dmg", "appimage"],
    "identifier": "com.electron.timetrack",
    "category": "Productivity",
    "macOS": {
      "frameworks": [],
      "minimumSystemVersion": "10.15",
      "entitlements": "src-tauri/entitlements.mac.plist",
      "providerShortName": null,
      "signingIdentity": "Developer ID Application: …"
    },
    "windows": {
      "nsis": {
        "installMode": "perMachine",
        "allowToChangeInstallationDirectory": true,
        "displayLanguageSelector": false
      }
    },
    "linux": {
      "appimage": { "bundleMediaFramework": false }
    }
  }
}
```

The `bundle.identifier` and `productName` values are deliberately **identical** to the legacy app's `CFBundleIdentifier` / `CFBundleName` (`com.electron.timetrack` / `TimeTrack`, verified against the signed `release/mac-arm64/TimeTrack.app/Contents/Info.plist` of the previous project). This makes the new build a drop-in upgrade — macOS treats it as the same app for permission grants (Accessibility, AppleEvents) and the Windows NSIS installer with the same `appId` overwrites an existing legacy installation in place rather than producing a parallel install.

NSIS is configured `perMachine` with the elevation flag so installations behave like the old `electron-builder.json` (`oneClick: false`, `perMachine: true`, `allowElevation: true`). The macOS universal binary (`x64 + arm64`) is produced with `tauri build --target universal-apple-darwin` and signed using the same Developer ID identity the previous project used.

### macOS entitlements (`src-tauri/entitlements.mac.plist`)

Migrated 1:1 from the old `dist/entitlements.mac.plist`:

```xml
<key>com.apple.security.cs.allow-jit</key><true/>
<key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/>
<key>com.apple.security.cs.allow-dyld-environment-variables</key><true/>
<key>com.apple.security.automation.apple-events</key><true/>
```

### macOS Info.plist additions

- `CFBundleIdentifier`: `com.electron.timetrack` (1:1 from the legacy app — see bundle settings above).
- `CFBundleName` / `CFBundleExecutable`: `TimeTrack` (1:1 from the legacy app).
- `NSAppleEventsUsageDescription`: "Please allow access to script browser applications to detect the current URL when triggering instant lookup." (verbatim from legacy project)
- `CFBundleURLTypes`: declares the `timesapp` URL scheme so macOS routes `timesapp://...` URLs to this bundle. The runtime registration via `tauri-plugin-deep-link` is in addition, not instead.
- `LSMinimumSystemVersion`: `10.15`.

### Auto-start of tracking

The `autoTracking.autoStartTracking` flag in `IDesktopConfig` (ADR-30006) is consumed by Angular at app bootstrap (not by Tauri). When `true`, the Angular `TimeTrackingService` calls `start()` immediately after auth resolves. This preserves the behavior of the old project; nothing in the Rust layer needs to know about it.

## Consequences

- **Each desktop integration concern is owned by one plugin**: window state, deep links, dialogs, single-instance, autostart, devtools. The custom Rust glue is limited to the `app:second-instance` → `app:deep-link` re-emit and the migration of the legacy `appSettings.json` from ADR-30006.
- **Functional parity with the old project plus one fix**: The Windows single-instance gap is closed; the macOS deep-link fragment quirk is preserved.
- **Plugin versions are pinned**: Tauri plugins ship per-major-version of Tauri. `Cargo.toml` pins each plugin to the exact minor compatible with Tauri 2; renovate-bot handles updates inside the major.
- **NSIS / DMG / AppImage parity**: All three packaging targets from the old `electron-builder.json` are reproduced. macOS notarization workflow is identical (sign + staple after `tauri build`).
- **Adding a new platform integration is local**: A new plugin requires a `Cargo.toml` entry, a `.plugin(...)` line in `main.rs`, a `permissions` entry in the capability file (ADR-30002), and a JS binding in `DesktopService` (ADR-30008). No bespoke infrastructure.
- **DevTools cannot leak to production**: The `devtools` Cargo feature is debug-only, so production builds have no DevTools attach surface — improvement over the old `electron-debug` setup which was guarded only at runtime.

## Alternatives Considered

- **Hand-roll each integration in Rust**: Reading argv, watching `WM_COPYDATA`, persisting bounds via the store plugin, etc. Rejected because the first-party plugins are well-maintained and remove an entire class of bugs (off-screen restore, multi-monitor edge cases, NSIS registry).
- **One mega-plugin**: Bundle deep-link + window-state + single-instance into a single TimeTracker-specific plugin. Rejected — the off-the-shelf plugins already do exactly this, and a custom mega-plugin would be a maintenance burden with no functional benefit.
- **Skip `tauri-plugin-window-state` and put bounds back into `IDesktopConfig`**: Possible. Rejected because bounds are *machine state*, not user preference (a config synced via Supabase Auth would otherwise sync window position across machines, which is wrong). Splitting bounds out of `IDesktopConfig` is the correct domain modeling.
