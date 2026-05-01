# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TimeTracker_2 is a desktop time-tracking application — a full rebuild of the legacy Electron-based TimeTracker on **Tauri 2** with an **Angular 21** frontend and **Supabase** as the primary backend. The same Angular bundle is also deployable as a pure web app; the desktop layer is feature-detected at runtime.

The complete architecture is documented as Architecture Decision Records under [`adrs/`](./adrs/README.md). **The ADRs are the source of truth.** This file summarises operational rules; if anything here disagrees with an ADR, the ADR wins.

## Working Method

This project is being rebuilt in **strictly sequential stages** (see `/Users/aki/Developer/NotesAndConcepts/TimeTracker/feature-analysis.md`). Phase 0 builds the empty-but-running shell (Angular project → Tauri shell → Material → shared scaffolding → theming → routing/i18n skeleton → Tauri depth). Each Phase-0 stage is a **manual verification gate**: Aki tests the stage in browser **and** Tauri window before the next stage starts. Phase 1+ adds feature modules one at a time, again gated by manual UI verification.

When implementing, do not jump ahead to features that depend on a stage that has not been verified yet.

## Development Commands

See `README.md` for the full command list. The most-used:

```bash
npm start                    # Angular dev server (http://localhost:4200)
npm run tauri:dev            # Tauri shell pointing at the dev server
npm run lint                 # ESLint
npm run prettier:fix         # Prettier write
npm run stylelint            # SCSS lint
npm test                     # Karma watch
npm run test:silent          # Karma single-run (CI)
npm run prepare:pr           # Lint + format + stylelint + tests
```

Pre-commit hooks (Husky + lint-staged) run `lint:fix`, `prettier:fix`, and `stylelint:fix` on staged files (ADR-10008).

## Architecture

### Module Structure (ADR-10005)

`NgModules` are the primary architectural building block. Standalone components are permitted only for fully independent components without service injections or project module imports.

- **`src/app/core/`** — singletons, imported once in `AppModule`
  - `providers/` — domain state providers (signal-based, see Provider Pattern below)
  - `services/` — application-wide services (`DesktopService`, `ThemeService`, `BackendProvider`, …)
  - `guards/` — route guards (`AutoLoginRoutesGuard`, …)
  - `interceptors/` — HTTP interceptors
  - `i18n/` — Transloco configuration
  - `constants/` — application constants
  - `utils/` — utility functions
  - `validators/` — custom form validators

- **`src/app/shared/`** — re-exported via `SharedModule` for feature modules
  - `base-components/` — Material-wrapping reusable components (`ButtonComponent`, `IconComponent`, …); declared by `BaseComponentsModule`
  - `material-components/` — `MaterialComponentsModule` re-exports the Material modules used by the project
  - `components/` — feature-specific shared components (`SharedHeaderComponent`, `PageNotFoundComponent`, …)
  - `directives/`, `pipes/`, `services/`, `types/`
  - `desktop/` — `IDesktopConfig` type + `ipc-contract.ts` (TS mirror of Rust IPC contract)

- **`src/app/modules/`** — lazy-loaded feature modules, each imports `SharedModule`
  - `auth/`, `tasks/`, `time-entries/`, `calendar/`, `activities/`, `settings/`, `holidays/`

- **`src/app/database/`** — entities, read models, and backend service interfaces/implementations
  - `entities/` — `BaseEntity` plus concrete entities (`TaskEntity`, `TimeEntryEntity`, …)
  - `read-models/` — `TaskReadModel`, `TimeEntryReadModel`, `FolderReadModel`
  - `services/interfaces/` — `ITaskService`, `IFolderService`, `ITimeEntryService`, …
  - `services/supabase/` — `SupabaseTaskService implements ITaskService`, …
  - `services/postgrest/` — alternative implementations (deferred, see ADR-20003)

- **`src-tauri/`** — Tauri 2 Rust core (only built for the desktop target)
  - `src/main.rs` — `invoke_handler!` registration + plugin setup
  - `src/contract.rs` — Rust mirror of the IPC contract
  - `src/activity/`, `src/idle/`, `src/system.rs` — custom commands
  - `src/migration.rs` — first-run migration of legacy `appSettings.json`
  - `binaries/` — sidecars (renamed from legacy `MacUtilities/`, `WinUtilities/`)
  - `capabilities/main.json` — capability ACL (default-deny)

Module tree:

```
AppModule
  ├── CoreModule (singletons, providers, DesktopService, auth, i18n)
  └── AppRoutingModule
      └── LayoutModule (app shell, SharedHeaderComponent)
          └── Feature modules (lazy-loaded)
              └── each imports SharedModule
```

### Path Aliases (ADR-10007)

Defined in `tsconfig.json`:

- `@app/*` → `src/app/*`
- `@core/*` → `src/app/core/*`
- `@shared/*` → `src/app/shared/*`
- `@modules/*` → `src/app/modules/*`
- `@database/*` → `src/app/database/*`
- `@environments/*` → `src/environments/*`

**Always use these aliases instead of relative imports.** The Tauri Rust code does not use these aliases (separate build).

### Component & Service Base Classes (ADR-10011)

A two-level base class hierarchy provides shared infrastructure:

```typescript
import { ComponentBase } from '@core/base/component-base';

@Component({ ... })
export class TasksOverviewComponent extends ComponentBase {
  // - DestroyRef + takeUntilDestroyed() for automatic subscription cleanup
  // - shared utility methods
}
```

```typescript
import { ServiceBase } from '@core/base/service-base';

@Injectable({ providedIn: 'root' })
export class TaskProvider extends ServiceBase {
  // - DestroyRef-based cleanup
  // - establishes the three-layer signal convention
}
```

All components extend `ComponentBase`. All stateful services (providers) extend `ServiceBase`.

### State Management (ADR-10002)

**Signals are the only state management mechanism.** No NgRx, no NGXS, no Akita, no NgRx Signal Store. State lives in domain providers (`SessionProvider`, `TaskProvider`, `TimeEntryProvider`, `ActivityProvider`, `FolderProvider`, `SettingsProvider`).

#### Three-layer convention

Every state signal follows this exact structure:

```typescript
@Injectable({ providedIn: 'root' })
export class TaskProvider extends ServiceBase {
  // Layer 1: private writable signal — only this service mutates it
  private readonly _taskList = signal<TaskEntity[]>([]);

  // Layer 2: public readonly signal — consumers read this
  readonly taskList = this._taskList.asReadonly();

  // Layer 3: RxJS bridge — only where guards/interceptors need an Observable
  readonly taskList$ = toObservable(this.taskList);
}
```

- **`computed()`** for derived state (read models, aggregations) — never recompute manually
- **`effect()`** for side effects (e.g., reload data when filter changes)

### Provider Pattern for Data Access (ADR-20004)

Components must not call backend services directly. The flow is:

```
Component
  └── Provider (state + orchestration)
       └── IXxxService (interface)
            └── SupabaseXxxService (concrete implementation, swappable via DI)
```

Providers manage state, loading/error signals, derived read models, request deduplication, and side-effect orchestration. Components only read signals from providers and call provider methods.

### Backend Abstraction (ADR-20001 / 20002 / 20003)

Each data domain has a TypeScript interface (`ITaskService`, `ITimeEntryService`, …). Concrete implementations are bound via `InjectionToken`. The active backend is selected via environment configuration. **Components and providers depend on the interface, never on `SupabaseTaskService` or `@supabase/supabase-js` directly.**

### Authentication (ADR-10013)

Supabase Auth, wrapped by `SessionProvider` (signal-based session state) and `IAuthService` (interface for swappability). Email/password, magic links, password reset, session persistence. Tokens never reach Node-style ambient APIs — see Tauri capability model below.

### Internationalization (ADR-10010)

`@jsverse/transloco` with translation files in `src/assets/i18n/` (`en-US.json`, `de-AT.json`). Default `en-US`. Lazy-load translations per route where applicable.

**All Transloco access is wrapped — consumers never import from `@jsverse/transloco` directly:**

- **Templates**: use the project's own `TranslatePipe` (selector `translate`), exported via `SharedModule`. Syntax: `{{ 'key' | translate }}` and `{{ 'key' | translate: { param } }}`. The Transloco structural directive (`*transloco="let t"`) and the built-in `transloco` pipe are **not** used.
- **Programmatic access**: inject `TranslationService` from `@core/i18n/translation.service`. It owns the active language signal (`selectedLanguageId$`), persistence (`localStorage` key `time-tracker-language`), Angular locale registration, and `documentElement.lang`. Use `instant()` for sync lookups and `selectTranslate()` for reactive ones.
- **Encapsulation guardrail**: an ESLint `no-restricted-imports` rule forbids `@jsverse/transloco` imports anywhere outside `src/app/core/i18n/`. `TranslationService` and `TranslatePipe` are the only consumers of the underlying library.

### Theming (ADR-10014)

Angular Material M3 theming with two themes (`light`, `dark`) emitted as scoped classes (`.theme-light`, `.theme-dark`) on `document.documentElement`. `ThemeService` owns a `theme` signal with three states: `'light' | 'dark' | 'system'`, default `'system'`. Custom SCSS reads project tokens only (`--app-color-*`, `--app-typography-*`, `--app-shape-*`, plus theme-scoped tokens such as `--app-tracker-running`, `--app-day-grid-line`, …). The mapping from Material's `--mat-sys-*` system tokens to `--app-*` lives exclusively in `src/styles/variables/_colors.scss`, `_typography.scss`, and `_shape.scss` — see ADR-10015. **Hard-coded hex values in SCSS are forbidden** — they break dark mode. **Direct `--mat-sys-*` references outside the token-mapping partials are forbidden** — they bypass the abstraction layer.

Persistence: `localStorage` key `time-tracker-theme`; mirrored into the Tauri store on the desktop target (read priority on launch: Tauri store → localStorage → `'system'`).

### Date Handling (ADR-10009)

`date-fns 4.1+`. Tree-shake imports — never `import * as dateFns`. Native `Date` objects throughout; no wrapper types. Locale comes from the active Transloco language.

### Desktop Layer (ADRs 30001-30008)

- **Runtime**: Tauri 2 with system WebView (WKWebView/WebView2/WebKitGTK) and a Rust core. No Node.js in the renderer.
- **Single Angular boundary**: `DesktopService` (`@core/services/desktop/desktop.service.ts`) is the only place in the Angular app that imports from `@tauri-apps/api` or `@tauri-apps/plugin-*`. Everything else calls `DesktopService` methods.
- **Web fallback**: `DesktopService.isDesktop` feature-detects `window.__TAURI_INTERNALS__`. In the web build, every method short-circuits to `null` / `EMPTY`. UI hides desktop-only settings.
- **IPC**: commands (`snake_case`, domain-prefixed: `activity_get_active_window`, `idle_get_system_idle_time`, `system_get_hostname`) for request/response; events (`kebab-case`, domain-prefixed: `app:deep-link`, `app:second-instance`) for unsolicited messages. The TypeScript contract `src/app/shared/desktop/ipc-contract.ts` and the Rust `src-tauri/src/contract.rs` are kept in sync, verified by `cargo test --test contract_parity`.
- **Capability ACL**: `src-tauri/capabilities/main.json` is a tight allow-list. Adding a Tauri capability requires editing the capability file, the Rust handler, the IPC contract, and (for events) the `DesktopService`. **Never grant `core:default` plus `*:default` to "make it work."**
- **Sidecars**: `timesapp-mac-active-win` (legacy `MacUtilities/main`) and `timesapp-win-browser-url` (legacy `WinUtilities/GetBrowserUrl.exe`) are reused as Tauri sidecars; `shell:allow-execute` is scoped to exactly those two names with argument validators.
- **Persistent config**: `tauri-plugin-store` under `appSettings.json`, key `app-settings`. The legacy `windowPosition` field is dropped (handled by `tauri-plugin-window-state` instead).

## Code Quality and Standards

### Angular Schematic Defaults

Configured in `angular.json`:

- `style: scss`
- `changeDetection: OnPush`
- `standalone: false` (module-based, see ADR-10005)
- `skipTests: true`

### TypeScript

Strict mode (ADR-10006) is on with **all** sub-flags, including `noUncheckedIndexedAccess`, plus Angular's `strictTemplates`, `strictInjectionParameters`, and `strictInputAccessModifiers`. **Do not loosen these.**

### Change Detection (ADR-10012)

`ChangeDetectionStrategy.OnPush` is the default. Components either use signals, immutable `@Input()`, or call `markForCheck()` explicitly.

## Coding Rules

These rules MUST always be followed when writing code.

### Template Rules

- **Signal/Computed binding**: Always declare signals and computed values at the top of the template using `@let prop = this.prop();` before using them in HTML. The variable name MUST match the property name exactly, and `this.` MUST be used:
  - Bad: `@let loading = isLoading();` (renamed variable, missing `this.`)
  - Good: `@let isLoading = this.isLoading();`
- **No method calls in templates**: Never use methods as bindings in HTML. Use a `Pipe` or `computed` property instead, whichever is more appropriate.
- **No comments**: Do not add comments in HTML or TypeScript files. Code should be self-explanatory through good naming and structure. Exception: `// TODO:` comments are allowed (e.g., `// TODO: Will be implemented in follow-up ticket (calendar view)`).
- **Use shared components**: Always prefer existing shared components (e.g., `ButtonComponent` for buttons). If a shared component lacks needed functionality, extend it rather than building a custom solution.

### TypeScript Rules

- **Explicit types**: Never use inline/implicit types. Always create named `type` or `interface` declarations.
  - Bad: `addFieldEvent = output<{ groupId: string; fieldCount: number }>()`
  - Good: `type AddFieldEvent = { groupId: string; fieldCount: number }` then `addFieldEvent = output<AddFieldEvent>()`
- **Always explicitly type `signal()`, `computed()`, `input()`, `output()`, `viewChild()`** — never rely on type inference for these:
  - Bad: `icon = computed(() => { ... })`
  - Good: `icon = computed<string>(() => { ... })`
  - Bad: `isVisible = signal(false)`
  - Good: `isVisible = signal<boolean>(false)`
- **Enums must always be used by name, never as raw numbers** — not even in HTML templates:
  - Bad: `@if (type === 0)`
  - Good: `@if (type === SearchTypeEnum.contains)`
- **`viewChild` must include `undefined`**: `viewChild` references must always have `| undefined` type, since the view may not be loaded. Provide proper handling for the undefined case.

### Signal Rules

- **Three-layer convention**: every state signal in a provider follows the writable → readonly → (optional) observable pattern. Never expose the writable signal.
- **No `Subject`/`BehaviorSubject` for state.** Use signals. RxJS is reserved for HTTP, guards, interceptors, and event streams (`DesktopService.deepLink$`).
- **`computed()` for derived state.** Never compute the same value in two places.
- **`effect()` for side effects only.** Do not use `effect()` to set other signals — that's what `computed()` is for.

### Styling Rules (ADR-10004 / 10014 / 10015)

- **No raw colour values** in component or shared SCSS. Use project `--app-*` tokens.
- **No direct `--mat-*` references** outside `src/styles/variables/_colors.scss`, `_typography.scss`, and `_shape.scss`. Components and pages MUST consume only `--app-color-*`, `--app-typography-*`, `--app-shape-*` (and the theme-scoped `--app-*` tokens defined in `_theme.scss`). If a component needs a Material design token that has no `--app-*` mapping yet, add the mapping to the appropriate partial in `src/styles/variables/` first, then consume the new `--app-*` token. This is the only allowed direction; never import a `--mat-*` token ad-hoc into a component.
- **Stylelint** must pass before commit.
- **Component-scoped styles** by default (`ViewEncapsulation.Emulated`). Global styles only in `src/styles/`.

### Desktop Rules

- **Never import from `@tauri-apps/*` outside `DesktopService`.** All renderer-to-core IPC goes through that single service.
- **Never call `window.require`, `process`, `os`, `fs`, `child_process`, or any Node-style API from the renderer.** These do not exist in the Tauri renderer; the capability ACL forbids them.
- **Adding a Tauri command** requires changes in four places: the Rust handler (`src-tauri/src/commands/...`), the `invoke_handler!` registration in `src-tauri/src/main.rs`, the TypeScript IPC contract (`src/app/shared/desktop/ipc-contract.ts`), and the capability file (`src-tauri/capabilities/main.json`). The `DesktopService` then exposes a typed wrapper.
- **Web fallback first**: when adding a desktop method, decide its web-fallback semantics (typically `null`) before implementing the Tauri call. The settings UI must hide desktop-only rows when `isDesktop === false`.
- **Never grant broad capabilities** (`core:default` + `*:default`, `fs:default`, `shell:allow-execute` without `name`/`args` scoping). Each new capability is justified in PR review.

### Database & Backend Rules

- **Components and providers depend on `IXxxService`** — never directly on `SupabaseXxxService` or `@supabase/supabase-js`.
- **Read models come from database views** (`tasks_extended`, `folders_extended`, `timeentries_extended`) — do not aggregate in the frontend by re-fetching all rows.
- **`BaseEntity` field `userid` is lowercase** to match the database schema. Do not rename to `userId`.
- **All tables enforce RLS** — every query must run under an authenticated session. Test with anonymous sessions to confirm denial.

### General

- **Prefer editing existing files** over creating new ones.
- **No backwards-compatibility hacks** (`_old`, `_v1`, `// removed`, dead re-exports). Delete unused code.
- **No defensive boilerplate** for cases that cannot happen — trust framework guarantees.
- **Per-feature PR/commit blocks** — one feature, one verified-in-browser-and-Tauri commit before the next feature starts.

## Testing

- Karma + Jasmine, watch mode for development, headless single-run for CI.
- Component tests stub `DesktopService` with hard-coded return values.
- Provider tests mock the injected `IXxxService` interface (no Supabase in unit tests).
- Rust contract parity is verified by `cargo test --test contract_parity` in CI.
- Coverage exclusions configured in `angular.json` (generated entities, base components, utility functions, route resolvers, routing modules).

## Pre-Commit & PR Hooks

Husky pre-commit runs `lint:fix`, `prettier:fix`, `stylelint:fix` via lint-staged on the staged file set. The CI pipeline runs the full lint check, unit tests, and (on the Rust side) `cargo fmt --check`, `cargo clippy`, and the contract-parity test.
