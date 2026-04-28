# Electron as Desktop Runtime

- **Status:** proposed
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The TimeTracker application requires desktop-specific capabilities that are not available in a web browser: active window monitoring, system idle time detection, system tray integration, global keyboard shortcuts, and native process/window introspection. The previous TimeTracker version uses Electron 39 with platform-specific native utilities for macOS and Windows.

## Decision

Electron is retained as the desktop runtime. Key reasons:

- **Node.js integration**: Full access to Node.js APIs for file system, child processes (native utilities), and OS-level operations
- **Native utility support**: The existing macOS and Windows native binaries for active window detection can be reused
- **Platform coverage**: Single codebase for macOS, Windows, and Linux desktop applications
- **Mature ecosystem**: electron-builder for packaging, auto-updater for distribution, established patterns for IPC communication
- **Web compatibility**: The Angular application can also run as a pure web app without Electron-specific features
- **Continuity**: The existing project's Electron integration (window management, tray, deep linking) is well-established

Desktop-specific features:
- Active window monitoring (title, process, URL, path)
- System idle time detection (`powerMonitor`)
- Window position/size persistence
- Zoom level persistence
- Deep linking (`timesapp://` protocol)
- System tray integration
- Auto-start tracking on launch

## Consequences

- Large application size (~150MB+ due to Chromium bundling) compared to Tauri (~10MB)
- Higher memory usage than native applications
- Security requires careful IPC design (see ADR-30002 for Context Isolation)
- Electron updates must track Chromium/Node.js security patches
- The web version of the app works without Electron, but lacks activity tracking and system integration features

## Alternatives Considered

- **Tauri**: Rust-based alternative with smaller binary size and lower memory usage. Rejected because:
  - The existing native utilities (macOS/Windows binaries) rely on Node.js child process spawning
  - Tauri uses system WebView (not Chromium), which may have rendering inconsistencies across platforms
  - Migration would require rewriting all IPC and native integration in Rust
  - The team has no Rust experience
- **Progressive Web App (PWA)**: No installation required. Rejected because PWAs cannot access active window information, system idle time, or native process introspection — the core features of the time tracker.
