# Sidecar binaries

Prebuilt platform helpers that ship with the Tauri bundle. Each binary is
declared in `src-tauri/tauri.windows.conf.json` (or the equivalent platform
config) and gated by the capability ACL in
`src-tauri/capabilities/main.json`.

## timesapp-win-browser-url-x86_64-pc-windows-msvc.exe

- **Purpose**: returns the active tab URL of the foreground browser window for
  the given process ID. Called from `src-tauri/src/activity/windows.rs` via the
  `tauri-plugin-shell` sidecar interface.
- **Origin**: legacy `WinUtilities/GetBrowserUrl.exe` from the previous
  Electron-based TimeTracker, renamed for the Tauri sidecar naming convention
  (`<name>-<target-triple>.exe`). The `.NET` runtime files in
  `src-tauri/resources/WinUtilities/` (`GetBrowserUrl.dll`,
  `Interop.UIAutomationClient.dll`, `*.deps.json`, `*.runtimeconfig.json`) are
  shipped alongside it.
- **ACL scope**: `shell:allow-execute` with `name: "binaries/timesapp-win-browser-url"`
  and a single integer argument validated by the regex `\d+` (the PID).
- **TODO before next Windows release**:
  - Document the upstream source location of `GetBrowserUrl` (legacy repo path
    or migrate the C# source into this repo and add a build step).
  - Capture the SHA-256 of the binary so future updates can be diffed against a
    known-good baseline.
  - Decide whether to replace the prebuilt binary with a CI build to remove the
    "executable in version control without provenance" risk flagged in review.
