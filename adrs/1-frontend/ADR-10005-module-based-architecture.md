# Module-based Architecture with Lazy Loading

- **Status:** approved
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The application has multiple feature areas (auth, tasks, time entries, calendar, activity overview, settings, holidays) that need clear boundaries and independent loading. The previous TimeTracker version uses feature modules with lazy loading. The MEP reference project (ADR-10010) establishes a proven module hierarchy with `CoreModule`, `SharedModule`, `BaseComponentsModule`, and lazy-loaded feature modules.

## Decision

NgModules are adopted as the primary architectural building block, following the MEP reference architecture:

- **`CoreModule`** — imported once in `AppModule`. Provides singleton services, database service factories, authentication, and localization setup.

- **`SharedModule`** — imported by feature modules. Re-exports `BaseComponentsModule` and provides shared components (Header, common pipes, directives).

- **`BaseComponentsModule`** — declares and exports reusable Material Design wrapper components. Imported via `SharedModule`.

- **Feature modules** — one per domain area (Auth, Tasks, TimeEntries, Calendar, ActivityOverview, Settings, Holidays). Each is lazy-loaded via `loadChildren` in the routing configuration.

Module tree:
```
AppModule
  ├── CoreModule (singletons, DB services, auth, i18n)
  └── AppRoutingModule
      └── LayoutModule (app shell)
          └── Feature modules (lazy-loaded)
              └── each imports SharedModule
```

**Exception:** Standalone components are permitted for fully independent components without service injections or project module imports.

## Consequences

- Explicit module boundaries enforce separation of concerns — feature modules cannot accidentally depend on another feature module's internals
- Lazy loading provides natural code-splitting boundaries, reducing initial bundle size
- `SharedModule` / `BaseComponentsModule` create a clear contract for reusable UI components
- More boilerplate compared to standalone components (module declarations, imports, exports)
- Goes against Angular's current recommended direction (standalone-first), which may create friction with future Angular updates
- Adding a new component requires updating both the component and its module's declarations

## Alternatives Considered

### Fully Standalone Components

Angular's recommended approach since v15+. Each component declares its own imports. Rejected because it scatters dependency management across many component files, makes it harder to enforce architectural boundaries, and provides no natural grouping mechanism for related components and services.

### Hybrid Approach (Modules + Standalone)

Using modules for feature boundaries but standalone for leaf components. Rejected because it requires a case-by-case decision for every new component, undermining architectural consistency.
