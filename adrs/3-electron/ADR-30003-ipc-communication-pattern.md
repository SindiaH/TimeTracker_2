# IPC Communication Pattern

- **Status:** proposed
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

With Context Isolation enabled (ADR-30002), all communication between the renderer (Angular) and main (Electron) processes must go through IPC. The previous TimeTracker version uses a flat set of IPC handlers (`getSystemIdleTime`, `getActiveWin`, `getConfig`, `saveConfig`) registered in an `IPCHelper`. The rebuild needs a structured IPC pattern that is type-safe, auditable, and extensible.

## Decision

A structured IPC communication pattern is adopted with the following principles:

### 1. Channel Naming Convention
IPC channels use a namespaced, kebab-case format:
```
<domain>:<action>
```
Examples: `activity:get-active-window`, `config:get`, `config:save`, `idle:get-system-idle-time`, `window:minimize`

### 2. Request-Response via `invoke`/`handle`
All renderer-to-main communication uses the `invoke`/`handle` pattern (returns a Promise), not `send`/`on` (fire-and-forget):

```typescript
// Main process
ipcMain.handle('activity:get-active-window', async () => {
  return await getActiveWindowInfo();
});

// Preload (exposed to renderer)
getActiveWindow: () => ipcRenderer.invoke('activity:get-active-window')
```

### 3. Main-to-Renderer Events
For unsolicited messages from main to renderer (deep links, tray actions), the main process sends events via `webContents.send()`, and the preload exposes event listeners:

```typescript
// Preload
onDeepLink: (callback: (url: string) => void) => {
  ipcRenderer.on('app:deep-link', (_event, url) => callback(url));
}
```

### 4. Type Safety
Shared TypeScript types define the IPC contract:

```typescript
// shared/ipc-channels.ts
export interface IpcChannels {
  'activity:get-active-window': { args: void; result: ActiveWindowInfo | null };
  'config:get': { args: void; result: ElectronConfig };
  'config:save': { args: ElectronConfig; result: void };
  'idle:get-system-idle-time': { args: void; result: number };
}
```

### 5. Handler Registration
All IPC handlers are registered in a centralized `registerIpcHandlers()` function called during app initialization, making the full IPC surface auditable in one place.

## Consequences

- Type-safe IPC prevents channel name mismatches and argument type errors
- Namespaced channels make it easy to find and audit all IPC for a specific domain
- `invoke`/`handle` pattern provides proper error propagation via rejected promises
- Centralized handler registration makes the IPC surface auditable
- Shared types between main and preload require a common TypeScript module (not compiled into the Angular app)
- Adding a new IPC channel requires changes in three places: main handler, preload exposure, shared types

## Alternatives Considered

- **Flat channel names (old project approach)**: Simple strings like `getActiveWin`. Rejected because it doesn't scale — channel names become ambiguous as the IPC surface grows, and there's no type safety.
- **Electron IPC via `send`/`on` only**: Fire-and-forget messaging. Rejected because most operations need a response (config values, active window info), and `send`/`on` requires manual correlation of request/response.
- **Comlink or postMessage abstraction**: Libraries that abstract IPC as async function calls. Rejected because they add complexity and obscure the IPC boundary, making security audits harder.
