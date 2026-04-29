# Capability-based Security Model

- **Status:** accepted
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The previous TimeTracker version creates its `BrowserWindow` with `nodeIntegration: true` and `contextIsolation: false`. The renderer therefore has direct access to `require('electron')`, `require('fs')`, `require('child_process')`, and `require('os')`. Any XSS in the Angular bundle (or in any third-party content the renderer ever loads) escalates to full local code execution. This is incompatible with the security goals of the rebuild.

Tauri 2 does not have a Node.js layer in the renderer. Instead it uses a capability-based ACL: by default the renderer can only call Rust commands and plugin commands that have been explicitly granted to it. This ADR fixes the security model used by TimeTracker_2.

## Decision

The Angular renderer runs in the system WebView with **no ambient OS access**. All host capabilities are declared explicitly in `src-tauri/capabilities/*.json` and granted to the main window only.

### Window configuration (`tauri.conf.json`)

```jsonc
{
  "app": {
    "security": {
      "csp": "default-src 'self'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.supabase.io;",
      "freezePrototype": true
    },
    "windows": [
      {
        "label": "main",
        "title": "TimeTracker",
        "minWidth": 480,
        "minHeight": 560,
        "resizable": true
      }
    ]
  }
}
```

### Capability declaration

Capabilities live in `src-tauri/capabilities/main.json` and list every permission the renderer is allowed to use. Only the capabilities required by the features in ADR-30001 are granted:

```jsonc
{
  "identifier": "main-capability",
  "windows": ["main"],
  "permissions": [
    "core:default",

    // Persistent config (ADR-30006)
    "store:allow-get",
    "store:allow-set",
    "store:allow-save",
    "store:allow-load",

    // File/folder picker for SQLite location (ADR-30007)
    "dialog:allow-open",

    // Window state restore + persistence (ADR-30007)
    "window-state:default",

    // Deep linking timesapp:// (ADR-30007)
    "deep-link:default",

    // Auto-start tracking flag plumbing (ADR-30007)
    "autostart:allow-is-enabled",

    // Custom commands defined in src-tauri/src/commands (ADR-30004)
    { "identifier": "allow-activity-commands", "allow": [
        { "command": "activity_get_active_window" },
        { "command": "idle_get_system_idle_time" },
        { "command": "system_get_hostname" }
    ]}
  ]
}
```

### Default-deny posture

- Any command not listed above is rejected at the Tauri core boundary before reaching Rust.
- The `fs`, `shell`, `http`, and `process` plugins are **not** included. The Angular renderer cannot read arbitrary files, spawn processes, or open URLs.
- CSP is enforced via the Tauri config and via the WebView; `connect-src` is scoped to the configured Supabase backend.
- `dangerousRemoteUrlIpcAccess` and `dangerousDisableAssetCspModification` are not used.

### Sidecar binaries

The macOS active-window helper (`MacUtilities/main`) and the Windows browser-URL helper (`WinUtilities/GetBrowserUrl.exe`) are bundled as Tauri sidecars (see ADR-30005). They are declared in `tauri.conf.json` under `bundle.externalBin` and granted execution only via the `shell:allow-execute` permission, scoped to those exact binary names — the renderer cannot execute arbitrary shell commands.

## Consequences

- **No ambient OS access in the renderer**: An XSS in Angular code can only reach the explicitly allow-listed commands, none of which expose arbitrary file or process operations.
- **Auditable surface**: The full set of host capabilities is enumerated in one capability file and reviewed during PR.
- **Breaking change vs. old project**: All renderer code that called `window.require('electron')`, `ipcRenderer.invoke(...)`, `fs`, `os.hostname()`, or `child_process` must be replaced with calls to the typed `DesktopService` (ADR-30008), which dispatches to Tauri commands.
- **CSP must be updated when adding new backends**: Any new HTTPS endpoint (e.g., a self-hosted PostgREST instance, see ADR-20003) requires a `connect-src` entry.
- **Sidecar names are fixed**: Adding a new platform helper requires both bundling it as `externalBin` and extending the shell scope — both changes are visible in code review.

## Alternatives Considered

- **Replicate the old `nodeIntegration: true` posture in Tauri**: Tauri does not offer a Node-style "everything is allowed" mode, and emulating one would require granting `shell:allow-execute` and `fs:allow-read-write` globally. Rejected outright; this is exactly the posture the rebuild is moving away from.
- **Single "allow all plugins" capability**: Granting `core:default` plus `*:default` for every plugin would work but defeats the purpose of an ACL. Rejected because the security review value comes from the capability file being a tight allow-list.
- **Custom protocol handler instead of CSP-restricted `https`**: Tauri can serve the frontend via a custom `tauri://` scheme. Considered but not needed — the Angular bundle is loaded from the bundled assets and there is no third-party iframe content, so the default CSP is sufficient.
