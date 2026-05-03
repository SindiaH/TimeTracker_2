# TimeTracker_2

A desktop time-tracking application — full rebuild of the legacy Electron-based TimeTracker on **Tauri 2** with an **Angular 21** frontend, **Supabase** as the primary backend, and a single Angular bundle that can also be served as a pure web app.

The architecture is documented as ADRs under [`adrs/`](./adrs/README.md). This README is operational; the ADRs are the source of truth for any architectural question. If a rule here disagrees with an ADR, the ADR wins.

## Project Layout

```
TimeTracker_2/
├── adrs/                       # Architecture Decision Records (source of truth)
├── src/
│   ├── app/
│   │   ├── core/               # Singletons: providers, services, guards, interceptors, i18n
│   │   ├── shared/             # SharedModule, BaseComponentsModule, MaterialComponentsModule
│   │   ├── modules/            # Lazy-loaded feature modules (auth, tasks, time-entries, …)
│   │   ├── database/           # Entities, read models, backend service interfaces & implementations
│   │   └── auth/               # Auth bootstrap & route guards
│   ├── assets/i18n/            # Transloco translation files (en, de)
│   ├── environments/           # local | development | test | production
│   └── styles/                 # Global SCSS, Material themes, design tokens
├── src-tauri/                  # Tauri 2 Rust core
│   ├── src/                    # Rust commands, IPC contract, migration, plugins setup
│   ├── binaries/               # Sidecars (mac active-window, win browser-url)
│   ├── resources/              # Sidecar companion files (WinUtilities DLLs)
│   ├── capabilities/           # Capability ACLs (default-deny)
│   ├── entitlements.mac.plist  # macOS entitlements (1:1 from legacy)
│   └── tauri.conf.json
└── package.json
```

## Development Commands

> The project skeleton is being bootstrapped in stages (see Phase 0 of `/Users/aki/Developer/NotesAndConcepts/TimeTracker/feature-analysis.md`). The commands below describe the target setup; some only become available once their stage lands.

### Web (Angular only)

```bash
npm start                    # Angular dev server — http://localhost:4200 (local environment)
npm run build                # Production build
npm run build:dev            # Development build
npm run build:test           # Test environment build
```

### Desktop (Tauri shell + Angular)

```bash
npm run tauri:dev            # Tauri dev — opens the desktop window pointing at http://localhost:4200
npm run tauri:build          # Production bundle for the current host platform
npm run tauri:build:mac      # Universal macOS .app/.dmg (x64 + arm64), signed + notarized
npm run tauri:build:win      # Windows NSIS installer (perMachine, allowElevation)
npm run tauri:build:linux    # Linux AppImage
```

The same Angular bundle runs in both targets. The `DesktopService` (see ADR-30008) feature-detects `window.__TAURI_INTERNALS__` and falls back to web behavior in the browser.

### Testing

```bash
npm test                     # Vitest in watch mode (jsdom, no browser)
npm run test:silent          # Vitest single-run (CI/PR)
npm run test:coverage        # Vitest with coverage report
```

### Linting & Formatting

```bash
npm run lint                 # ESLint (Angular rules)
npm run lint:fix             # ESLint with auto-fix
npm run prettier             # Prettier check
npm run prettier:fix         # Prettier write
npm run stylelint            # Stylelint (SCSS)
npm run stylelint:fix        # Stylelint auto-fix
```

`husky` + `lint-staged` run `lint:fix`, `prettier:fix`, and `stylelint:fix` on staged files before each commit (see ADR-10008). Husky `pre-push` runs `npm run test:silent` (see ADR-10016).

### Pre-PR

```bash
npm run prepare:pr           # Lint, format, stylelint, and unit tests
```

## Environments

Four configurations (`local`, `development`, `test`, `production`) wired via `angular.json` `fileReplacements` and `src/environments/`. `local` is the default for `npm start`.

## Tauri Build Prerequisites

- Rust toolchain (`rustup`, `cargo`) — Tauri builds the desktop core natively
- Platform WebView SDK (WKWebView on macOS, WebView2 runtime on Windows, WebKitGTK on Linux)
- For macOS release builds: Apple Developer ID identity (same one used by the legacy app)
- For Windows release builds: Authenticode certificate

The web-only build (`npm run build`) does not require Rust.

## ADR Index

| Category            | Directory                  | Highlights                                                            |
|---------------------|----------------------------|------------------------------------------------------------------------|
| Frontend            | `adrs/1-frontend/`         | Angular 21, Signals, Material, OnPush, strict TS, Transloco, theming   |
| Backend Integration | `adrs/2-backend-integration/` | Interface-based abstraction, Supabase primary, PostgREST alternative   |
| Tauri               | `adrs/3-tauri/`            | Tauri 2 runtime, capability ACL, IPC pattern, sidecars, plugins        |
| Database            | `adrs/4-database/`         | Entity model, read-model views, RLS                                    |

See [`adrs/README.md`](./adrs/README.md) for the full list with status.

## Side-by-Side with the Legacy App

While the new build is stabilising it ships under a separate identity so it can run alongside the legacy Electron app: `CFBundleIdentifier` `com.electron.timetrack2`, product name `TimeTrack2`, deep-link scheme `timesapp2://`. macOS permission grants (Accessibility, AppleEvents) therefore have to be re-issued for the new bundle. A first-run hook in `src-tauri/src/migration.rs` copies the legacy `appSettings.json` into `tauri-plugin-store` non-destructively — the legacy file is read but never moved or renamed, so the original install keeps working (see ADR-30006).
