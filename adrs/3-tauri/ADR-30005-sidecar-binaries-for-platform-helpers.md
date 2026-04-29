# Sidecar Binaries for Platform-Specific Helpers

- **Status:** accepted
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The previous TimeTracker project ships two platform-specific native binaries that are not trivial to port:

- **`app/helpers/MacUtilities/main`** (and `main_x64`): a Swift/Objective-C helper that uses Accessibility APIs and AppleEvents to read the foreground window plus, for Safari / Chrome / Firefox / Edge, the URL of the active tab. The Intel build is `main_x64`; the arm64 build is `main`.
- **`app/helpers/WinUtilities/GetBrowserUrl.exe`** (plus its DLL dependencies): a .NET helper that uses UI Automation to read the URL of the foreground browser window on Windows. Bundled as `extraResources` and unpacked from `app.asar` via `asarUnpack` in the previous Electron config.

Both binaries are functional and well-tested. Re-implementing them in Rust would be weeks of work and would re-introduce the bugs that have been fixed there over time. The active-window detection itself can be done in pure Rust on Windows/Linux (ADR-30004), but URL extraction cannot — it requires platform-specific automation APIs that are easier to call as a child process than to bind directly.

## Decision

The two existing native helpers are kept as **Tauri sidecar binaries**. The Rust core invokes them via `tauri::api::process::Command::new_sidecar(...)`, parses their stdout, and returns the result through the `activity_get_active_window` command (ADR-30004).

### Bundling

`tauri.conf.json` declares the sidecars under `bundle.externalBin`:

```jsonc
{
  "bundle": {
    "externalBin": [
      "binaries/timesapp-mac-active-win",
      "binaries/timesapp-win-browser-url"
    ]
  }
}
```

Sidecar files live in `src-tauri/binaries/` with the platform-target suffix Tauri expects:

```
src-tauri/binaries/
  timesapp-mac-active-win-aarch64-apple-darwin
  timesapp-mac-active-win-x86_64-apple-darwin
  timesapp-win-browser-url-x86_64-pc-windows-msvc.exe
```

The macOS `main` binary is renamed to `timesapp-mac-active-win-aarch64-apple-darwin`; `main_x64` becomes `timesapp-mac-active-win-x86_64-apple-darwin`. The `WinUtilities/GetBrowserUrl.exe` and its dependent DLLs are placed alongside the renamed `timesapp-win-browser-url-*.exe`. Tauri preserves directory companions when bundling sidecars.

### Capability scope

The `shell` plugin's `allow-execute` permission (ADR-30002) is scoped to **only** these two sidecar names:

```jsonc
{
  "permissions": [
    {
      "identifier": "shell:allow-execute",
      "allow": [
        { "name": "timesapp-mac-active-win", "sidecar": true, "args": ["--no-screen-recording-permission"] },
        { "name": "timesapp-win-browser-url", "sidecar": true, "args": [{ "validator": "\\d+" }] }
      ]
    }
  ]
}
```

The Windows sidecar's argument is the process ID, validated as digits-only at the Tauri layer to defeat any path/argument injection if the call site is ever compromised.

### Invocation pattern

```rust
// src-tauri/src/activity/macos.rs
pub async fn get_active_window() -> Result<Option<ActiveWindowInfo>, ActivityError> {
    let (mut rx, _child) = Command::new_sidecar("timesapp-mac-active-win")?
        .args(&[]) // no flags by default; --no-screen-recording-permission opt-in
        .spawn()?;
    let mut stdout = String::new();
    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line) = event { stdout.push_str(&line); }
    }
    let info: ActiveWindowInfo = serde_json::from_str(&stdout)?;
    Ok(Some(info))
}
```

```rust
// src-tauri/src/activity/windows.rs
pub async fn get_browser_url(pid: u32, process_name: &str) -> Result<String, ActivityError> {
    if !is_browser(process_name) { return Ok(String::new()); }
    let (mut rx, _child) = Command::new_sidecar("timesapp-win-browser-url")?
        .args(&[pid.to_string()])
        .spawn()?;
    // collect stdout, return as String
}
```

The browser allow-list (`chrome`, `firefox`, `edge`) is preserved verbatim from the previous `WindowsUrlHelper.ts`.

### macOS code-signing and entitlements

The sidecar is a separate Mach-O binary and must be signed and notarized as part of the `.app` bundle. The signing identity used for the main app is reused for both sidecar architectures. Required entitlements on the sidecar (ADR-30007):

- `com.apple.security.automation.apple-events` — for Safari / Chrome / Firefox URL extraction
- `com.apple.security.cs.allow-jit` — preserved from the previous bundle
- `com.apple.security.cs.allow-unsigned-executable-memory` — preserved from the previous bundle

The `tauri.conf.json` `bundle.macOS.entitlements` field points to `src-tauri/entitlements.mac.plist`, migrated 1:1 from the previous project's `dist/entitlements.mac.plist`.

### Windows DLL companions

The previous project unpacked the entire `WinUtilities/` folder via `asarUnpack`. With Tauri the folder is copied into the bundle next to the renamed `.exe` via `bundle.resources`:

```jsonc
{
  "bundle": {
    "resources": ["resources/WinUtilities/*.dll"]
  }
}
```

The `.exe` resolves its DLLs from the same directory at runtime; no relative-path gymnastics are needed (no `app.asar` to unpack from).

## Consequences

- **No reimplementation cost**: The macOS Swift helper and the Windows .NET helper are reused as-is. URL extraction continues to work on Safari / Chrome / Firefox / Edge with no behavioral change.
- **Fixed sidecar set in the capability ACL**: The renderer cannot spawn arbitrary processes; only these two sidecars with their argument-validated invocations are reachable, and only indirectly via the Rust commands in ADR-30004.
- **macOS notarization complexity**: Both architectures of the macOS sidecar must be notarized. The CI signs both as part of the universal-binary build. (Same complexity existed in the old project, which already produced a universal `.app` with the bundled binary.)
- **Windows resource folder**: The DLL companions for `GetBrowserUrl.exe` are copied as bundle resources. The bundle layout differs from the old `app.asar.unpacked` location but the runtime contract (DLLs next to EXE) is identical.
- **Sidecar absence is a recoverable error**: If a sidecar is missing or fails to start (e.g., on Linux for the macOS sidecar), the Rust command returns `None` and the renderer falls back to "no activity recorded" — same degraded mode the old project had on unsupported platforms.
- **Future replacement is local**: If the macOS or Windows helpers are ever rewritten in Rust, only the bodies of `activity::macos::get_active_window` and `activity::windows::get_browser_url` change — the command contract (ADR-30003), the renderer (ADR-30008), and the capability file remain stable.

## Alternatives Considered

- **Rewrite both helpers in Rust**: Possible. `core-graphics` + `objc2` on macOS for Accessibility, `windows` + UI Automation on Windows for URL extraction. Rejected for the rebuild because it duplicates working code; revisit when there is a real maintenance reason (e.g., a macOS API deprecation that breaks the existing helper).
- **Embed the helpers as static libraries linked into the Rust binary**: Tighter integration, no child-process overhead. Rejected because the macOS helper is an `.app`-style sandboxed binary that uses AppleEvents — running it in-process inside the Tauri app changes the entitlement story and would require re-signing tests.
- **Run the helpers via an explicit per-OS shell command**: Same as the sidecar but without Tauri's path resolution and capability scoping. Rejected because the sidecar mechanism gives free path resolution, code-sign association with the parent app, and ACL scoping.
