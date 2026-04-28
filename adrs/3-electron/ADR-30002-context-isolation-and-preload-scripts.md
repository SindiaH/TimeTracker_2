# Context Isolation and Preload Scripts

- **Status:** proposed
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The previous TimeTracker version does not use Context Isolation — the renderer process has direct access to Node.js APIs and Electron's IPC module via `nodeIntegration: true`. This is a significant security risk: any XSS vulnerability in the renderer would give an attacker full Node.js access (file system, child processes, network). Electron's documentation recommends Context Isolation as a security best practice since Electron 12, and it is the default since Electron 20.

## Decision

Context Isolation is enabled with Preload Scripts as the sole communication bridge between the renderer and main processes:

- **`contextIsolation: true`**: The renderer runs in a sandboxed context without access to Node.js or Electron APIs
- **`nodeIntegration: false`**: Node.js APIs are not available in the renderer
- **`sandbox: true`**: Full sandbox mode for the renderer process
- **Preload Script**: A preload script runs in a privileged context and exposes a controlled API to the renderer via `contextBridge.exposeInMainWorld()`

Preload API surface:
```typescript
// preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  // Activity tracking
  getActiveWindow: () => ipcRenderer.invoke('get-active-window'),
  getSystemIdleTime: () => ipcRenderer.invoke('get-system-idle-time'),

  // Configuration
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: ElectronConfig) => ipcRenderer.invoke('save-config', config),

  // Window management
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // Events from main process
  onDeepLink: (callback: (url: string) => void) =>
    ipcRenderer.on('deep-link', (_event, url) => callback(url)),
});
```

The Angular application accesses this API via `window.electronAPI`, wrapped in an `ElectronService` that provides type-safe methods and handles the web-only case (no `electronAPI` available).

## Consequences

- **Security improvement**: The renderer cannot access Node.js APIs, file system, or child processes directly — all access goes through the controlled preload API
- **Explicit API surface**: Every capability exposed to the renderer is explicitly listed in the preload script, making the security surface auditable
- **Breaking change from old project**: All direct `ipcRenderer` usage in Angular code must be replaced with `window.electronAPI` calls
- **Web compatibility**: The `ElectronService` can check for `window.electronAPI` existence, enabling the same Angular code to run in both Electron and browser environments
- **Additional file to maintain**: The preload script must be kept in sync with IPC handlers in the main process

## Alternatives Considered

- **`nodeIntegration: true` (old project approach)**: Simplest — renderer has full Node.js access. Rejected because it violates Electron's security recommendations and any XSS vulnerability would escalate to full system access.
- **`nodeIntegration: true` with Content Security Policy**: CSP can mitigate some XSS vectors but does not prevent malicious scripts from using Node.js APIs if `nodeIntegration` is enabled. Rejected as insufficient.
