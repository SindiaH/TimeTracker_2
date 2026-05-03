# Vitest as Unit Testing Framework

- **Status:** accepted
- **Date:** 2026-05-03
- **Participants:** Aki

## Context

TimeTracker_2 currently has no working unit test setup. `CLAUDE.md` mentions Karma + Jasmine as a placeholder, but `package.json` defines no `test` script, `angular.json` defines no `test` target, and there are no `*.spec.ts` files in the repository. Tests therefore are not gated on PRs and not enforced in any pre-commit hook.

The legacy TimeTracker and the Brandspot Hub reference project (`/Users/aki/Developer/premedia.navis.shop.frontend/Premedia.Brandspot.Hub/BrandspotHubApp`) both use Karma + Jasmine. Karma is in long-term maintenance mode and is being phased out of the Angular toolchain. The Brandspot Hub project, however, has invested heavily in a reusable test infrastructure (`src/tests/testing/`, `src/tests/testing-data-client/`) that is worth carrying over conceptually:

- a `TestingModule` that pre-provides stubs for application-wide services (`TranslationService`, `ToastService`, `ChangeDetectorRef`, `ActivatedRoute`, …)
- a `TestingComponentModule` that re-imports the `BaseComponentsModule`/animations stack so component fixtures don't have to wire UI prerequisites case-by-case
- an auto-mock factory (`createClientMock` + `autoMockProvider`) that turns every method of a generated client class into an empty Observable, eliminating hand-maintained stub files for backend interfaces

Constraints and requirements:

- Strict TypeScript (ADR-10006) — tests must not loosen typing.
- No real backend in unit tests — Supabase (`@supabase/supabase-js`) and Tauri (`@tauri-apps/*`) APIs must be stubbed at the abstraction boundary defined by ADR-20001 (backend interfaces) and ADR-30008 (`DesktopService`).
- Provider-pattern tests (ADR-20004) need to assert signal state transitions, derived `computed()` outputs, and error paths.
- Tests must run headless in CI and as part of the local PR gate, fast enough not to slow down the workflow.
- Phase-0 of the rebuild is gated on manual verification per stage; introducing an automated test layer must not stall that flow — so tests are scoped to *meaningful* behaviour, not coverage padding.

## Decision

### Test runner

Adopt **Vitest** as the unit test runner via Angular 21's experimental first-party `@angular/build:unit-test` builder. Vitest runs in **jsdom**, uses native ESM, and provides the assertion API (`expect`), the spy API (`vi.fn()`, `vi.spyOn()`), and parallel workers out of the box. Angular's `TestBed`, `ComponentFixture`, `fakeAsync`, and `tick` continue to be used for component/service wiring — only the surrounding runner changes.

`angular.json` gains a `test` target:

```jsonc
"test": {
  "builder": "@angular/build:unit-test",
  "options": {
    "tsConfig": "tsconfig.spec.json",
    "runner": "vitest",
    "buildTarget": "TimeTracker_2:build:development"
  }
}
```

`vitest.config.ts` at the project root configures jsdom, coverage (`@vitest/coverage-v8`), reporters, and exclusions.

### Test infrastructure layout

A dedicated `src/testing/` tree mirrors the Brandspot Hub patterns, adapted to the TimeTracker_2 architecture:

```
src/testing/
├── constants/
│   └── testing.constants.ts          # TESTING_TRANSLATE_PREFIX, fixed dates, …
├── mocks/                             # plain data fixtures (no DI)
│   ├── task.mock.ts
│   ├── time-entry.mock.ts
│   └── session.mock.ts
├── stubs/                             # @Injectable stubs that override real services
│   ├── desktop-service.stub.ts        # extends DesktopService, all methods → null/EMPTY
│   ├── theme-service.stub.ts
│   ├── translation-service.stub.ts    # instant() returns TESTING_TRANSLATE_PREFIX + key
│   ├── translate-pipe.stub.ts         # PipeTransform → returns key unchanged
│   └── angular.stubs.ts               # ChangeDetectorRef, Router, ActivatedRoute, …
├── spies/                             # vi.fn-based factory functions
│   ├── session-provider.spy.ts
│   ├── task-provider.spy.ts
│   └── time-entry-provider.spy.ts
├── backend/
│   ├── auto-mock.factory.ts           # createBackendMock<T>() + autoMockProvider()
│   └── testing-backend.module.ts      # binds every IXxxService token to an auto-mock
├── testing.module.ts                  # global stubs (services, pipes, Router, ActivatedRoute)
└── testing-component.module.ts        # TestingModule + BaseComponentsModule + MaterialComponentsModule + BrowserAnimationsModule
```

A new path alias is added to `tsconfig.json`: `@testing/*` → `src/testing/*` (consistent with ADR-10007).

### Three-layered TestBed modules

1. **`TestingModule`** — provides stubs for the project's application-wide services (`DesktopService`, `ThemeService`, `TranslationService`, `TranslatePipe`, plus angular primitives like `ActivatedRoute`). Imported by every spec file that needs Angular DI.
2. **`TestingComponentModule`** — imports `TestingModule` plus the UI prerequisites required by the `SharedModule`: `BaseComponentsModule`, `MaterialComponentsModule`, `BrowserAnimationsModule`, project pipes/directives. Imported by component specs.
3. **`TestingBackendModule`** — auto-mocked providers for every backend interface token (`ITaskService`, `ITimeEntryService`, `IFolderService`, `IAuthService`, …). Imported by provider specs and by component specs whose providers reach the data layer.

This split keeps service specs lightweight (no UI module overhead) while still giving component specs a one-line setup.

### Auto-mock factory for backend interfaces

The `createBackendMock<T>()` helper accepts an `InjectionToken<T>` plus a sample shape (or a constructor reference where one exists) and returns an object whose methods all return `EMPTY` Observables and whose properties all return `null`. `autoMockProvider(token)` wraps it as a DI provider entry. Tests override individual methods with `vi.spyOn(svc, 'method').mockReturnValue(of(fixture))`. When a new method is added to an `IXxxService`, no stub file needs updating — the mock keeps compiling and the spec only spies on what it cares about. This is the same pattern as Brandspot Hub's `createClientMock`, retargeted from NSwag classes to TimeTracker's interface tokens.

### Test scope policy

Tests are written for **business logic only**. Concretely:

- **Required**:
  - Domain providers (`SessionProvider`, `TaskProvider`, `TimeEntryProvider`, `ActivityProvider`, `FolderProvider`, `SettingsProvider`) — signal state transitions, `computed()` derivations, `effect()` side effects, error/loading flag handling, request deduplication.
  - Custom validators (`@core/validators/`).
  - `TranslationService`, `ThemeService`, and `DesktopService` web-fallback branches.
  - Pipes with logic (project `TranslatePipe`, any future formatting pipes).
  - Read-model mappers and any frontend aggregations the database doesn't already deliver.
- **Forbidden / out of scope**:
  - Trivial presentational components with no behaviour beyond template binding.
  - `BaseEntity` and other generated/data-only entity classes.
  - Re-export wrappers in `BaseComponentsModule` (they wrap Material — Material owns the tests).
  - `*-module.ts`, `*-routing-module.ts`.
  - `src/app/shared/desktop/ipc-contract.ts` — type-only mirror, parity with Rust is verified by `cargo test --test contract_parity`.
- **Optional**: feature components are only tested when they own non-trivial behaviour (e.g., form orchestration, conditional view state).

These exclusions are codified in `vitest.config.ts` under `coverage.exclude` so coverage numbers reflect testable surface area only.

### NPM scripts and PR gate

`package.json` gains:

```jsonc
"test": "ng test",
"test:silent": "ng test --watch=false",
"test:coverage": "ng test --watch=false --code-coverage",
"prepare:pr": "npm run lint:fix && npm run prettier:fix && npm run stylelint:fix && npm run test:silent"
```

Husky `pre-commit` stays scoped to lint-staged (fast); a Husky `pre-push` hook runs `npm run test:silent` so the test suite is one push-time check away from CI. CI runs `npm run test:silent` after lint and before `cargo` checks.

## Consequences

- **Faster feedback loop** — Vitest watch mode + jsdom is dramatically faster than Karma + Chrome; specs rerun on file save without a browser launch cycle.
- **CI simplification** — no Chrome / chromedriver dependency; jsdom runs in any headless container.
- **Low-friction component tests** — `TestingComponentModule` removes the per-spec boilerplate of importing animations, base components, Material, and translation infrastructure.
- **Provider tests are first-class** — `TestingBackendModule` + auto-mock factory means a `TaskProvider` spec only needs to declare which `ITaskService` calls to stub for the scenario under test.
- **PR gate now blocks on red tests** — `prepare:pr` extends from a formatting-only step into a real correctness check; the suite must stay fast (<30 s wall-clock target on a developer machine) for this to remain bearable.
- **Stale `CLAUDE.md` reference fixed** — the project-instructions section claiming Karma is updated alongside this ADR.
- **Experimental builder risk** — `@angular/build:unit-test` Vitest support is still flagged experimental in Angular 21; minor-version upgrades may require config tweaks. Mitigation: configuration is centralised in `vitest.config.ts` and the `angular.json` `test` target.
- **One-time setup cost** — writing the `src/testing/` scaffolding and back-filling specs for the providers and services that already exist in `core/` is a non-trivial chunk of work and lands as its own dedicated stage in the Phase-0 sequence.

## Alternatives Considered

- **Karma + Jasmine** — Angular's historical default and the stack used by both legacy TimeTracker and Brandspot Hub. Rejected: Karma is in maintenance mode, requires a real browser in CI, and is significantly slower than Vitest. Continuing on Karma for a fresh codebase would lock the project into a deprecating tool.
- **Jest + `jest-preset-angular`** — mature, widely deployed. Rejected: not first-party, requires CommonJS shims that conflict with Angular 21's ESM-first tooling, and Vitest's API and watch performance now lead Jest's for new projects.
- **Web Test Runner (Modern Web)** — Angular's other experimental runner option. Rejected: smaller ecosystem, fewer Angular-specific examples, and the `@angular/build:unit-test` Vitest path has clearer documentation.
- **Cypress component testing** — would also serve some component specs. Rejected for unit-test scope: heavyweight and overlaps with the planned end-to-end story; component-level interaction tests stay in Vitest + jsdom for now and a separate ADR will cover E2E once Phase 1+ stabilises.
- **No automated tests at this stage** — a lighter Phase-0 option, leaning on the manual-verification gates. Rejected: providers and the auth/theme/translation services already contain non-trivial business logic that has regressed silently before (the signout fix in commit `e3c490d` is a recent example), and the cost of writing focused provider tests is small compared to debugging similar regressions later.
