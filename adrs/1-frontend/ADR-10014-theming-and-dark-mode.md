# Theming and Dark/Light Mode

- **Status:** accepted
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

TimeTracker_2 must support both a light and a dark colour theme and let the user switch between them at runtime. The previous TimeTracker version had no explicit theming layer and shipped only a single light style; users running the app at night reported eye strain. Modern desktop OSes (macOS, Windows 11, recent GNOME/KDE) expose a system-wide light/dark preference, and users expect desktop apps to honour it by default.

The chosen UI library is Angular Material (see ADR-10003), which since v17 provides an M3-based SCSS theming API with first-class light/dark colour roles. The MEP reference project (`BrandspotHubApp`) ships a single Material theme without a dark variant, so it does not constrain this decision.

The shared `BaseComponentsModule` (see ADR-10003) wraps Material components. Any colour decision therefore needs to flow through Material's theming tokens rather than through ad-hoc colour variables, otherwise the wrappers and the Material primitives drift apart.

Constraints:

- The Angular bundle MUST run as both a web app and inside Tauri, so theming cannot rely on Tauri APIs.
- The user's choice MUST persist across app restarts.
- A "follow system" option MUST exist and react to live OS preference changes (`prefers-color-scheme` media query).
- Custom SCSS in `src/styles/` and component styles MUST be able to read theme colours so that bespoke chrome (calendar grid, day-view blocks) matches the active theme.

## Decision

Theming is implemented on top of Angular Material's M3 theming API with a runtime theme switcher backed by user settings.

### Theme definitions

- Two SCSS theme objects are defined in `src/styles/themes/`:
  - `_light-theme.scss` — Material `define-theme()` with the project's primary/tertiary palette and `color-scheme: light`.
  - `_dark-theme.scss` — same palette, `color-scheme: dark`.
- A single `src/styles/_theme.scss` partial emits both themes scoped by selector:
  - `:root, .theme-light { @include mat.all-component-themes($light-theme); }`
  - `.theme-dark { @include mat.all-component-themes($dark-theme); }`
- All custom component styles read Material's CSS custom properties (`var(--mat-sys-surface)`, `var(--mat-sys-on-surface)`, etc.) — never hard-coded hex values. A small set of project-specific tokens (e.g., `--app-tracker-running`, `--app-day-grid-line`) is defined per theme in the same partial.

### Runtime switcher

A `ThemeService` (`src/app/core/services/theme/theme.service.ts`) owns a `theme` signal with three states: `'light' | 'dark' | 'system'`.

- On bootstrap the service reads the persisted preference (default `'system'`).
- The effective class (`theme-light` or `theme-dark`) is applied to `document.documentElement` via a `Renderer2` effect.
- For `'system'`, the service subscribes to `window.matchMedia('(prefers-color-scheme: dark)')` and re-applies the class when the OS preference changes.
- The service exposes `setTheme(value)` and an `isDark` computed signal for templates.

### Persistence

- **Web target**: `localStorage` key `time-tracker-theme`.
- **Desktop target**: identical key, but mirrored into the Tauri store (`tauri-plugin-store`, see ADR-30006) under `windowOptions.theme` so the choice survives a fresh OS user profile that wipes the WebView's localStorage. Read-priority on launch: Tauri store → localStorage → `'system'`.

### UI

A theme toggle (Material `mat-button-toggle-group` with light/dark/system options) lives in the shared header (`SharedHeaderComponent`) and binds to `themeService.theme`. The toggle is the only UI surface that writes to the service; all other components read `isDark` if they need to branch.

## Consequences

- **Single source of truth for colours**: All component styles funnel through Material's M3 tokens. New components inherit theming for free; no per-component dark-mode SCSS branches are needed.
- **System preference works on day one**: Users who never open the toggle still get a dark UI when their OS is dark, matching platform expectations.
- **Bundle cost**: Two themes ship side-by-side as scoped CSS rules. Measured cost on the MEP reference is ~6 KB gzipped — negligible.
- **WebView quirks**: macOS WKWebView and Windows WebView2 evaluate `prefers-color-scheme` correctly; Linux WebKitGTK does on recent versions. The fallback path (`'light'` if the media query is unsupported) keeps the app usable.
- **Migration**: The Alt-App had no theme persistence. Migration (see Section 12 of the feature-analysis) defaults the theme to `'system'`; no legacy field is read.
- **Test gate**: After the theming layer is introduced, the user manually verifies (light, dark, follow-system, OS-toggle-while-running, app-restart) before any feature is built on top.

## Alternatives Considered

- **CSS-variable-only approach without Material theming**: Define all colours as raw `--app-*` variables and toggle via a class on `<body>`. Rejected because Material components would still ship their own M2 default palette, leading to two disconnected colour systems.
- **Two compiled stylesheets, swapped via `<link rel="stylesheet">`**: Conceptually clean but causes a visible flash on switch and complicates the build (two CSS bundles per locale). Scoped selectors in one bundle avoid both issues.
- **Tailwind `dark:` utility classes**: Would require introducing Tailwind on top of Material — explicitly rejected in ADR-10004 (SCSS-only).
- **No dark mode for v1**: Simplest path, but the rebuild is the natural moment to add it; retro-fitting later means revisiting every component style.
