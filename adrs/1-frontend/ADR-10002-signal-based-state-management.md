# Signal-based State Management without External Libraries

- **Status:** approved
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The application manages several state domains: session/auth state, task list, time entries, running timer, activity data, idle info, calendar settings, and UI state. The previous TimeTracker version already migrated to Angular Signals for state management, moving away from mixed RxJS/imperative patterns. The MEP reference project (ADR-10011) establishes a proven signal-based pattern with a three-layer convention. The rebuild needs a consistent, lightweight approach that avoids the boilerplate of external state management libraries while maintaining type safety and predictable data flow.

## Decision

Angular Signals are adopted as the primary state management mechanism, without external libraries like NgRx, NGXS, or Akita. The approach follows the MEP reference architecture:

- **Native Angular primitive**: Signals are built into Angular v21+ and tightly integrated with change detection (especially OnPush), eliminating Zone.js and the `async` pipe for synchronous state reads
- **Service-scoped state**: State is encapsulated in provider services (e.g., `SessionProvider`, `TaskProvider`, `TimeEntryProvider`, `ActivityProvider`), each managing their own signals
- **Three-layer convention**:
  1. Private writable `signal()` for internal mutations
  2. Public readonly signal via `asReadonly()` for consumers
  3. `toObservable()` bridge to RxJS where needed (guards, interceptors)
- **Derived state**: `computed()` for read models and aggregated views (e.g., `TaskReadModel` with `childCount` and `duration`)
- **Side effects**: `effect()` for reactive side effects (API calls triggered by filter changes, data transformations)

All stateful services extend a common base class that provides subscription management and shared infrastructure.

## Consequences

- No external dependencies for state management — reduces bundle size and avoids library lock-in
- OnPush change detection becomes the safe default, as signals automatically notify Angular's change detection
- Provider pattern creates clear ownership of state domains
- No built-in dev tools for state inspection (unlike NgRx DevTools)
- No formalized action/reducer pattern — state mutations are method calls, which requires disciplined encapsulation
- Naming conventions and encapsulation rules must be enforced by code review

## Alternatives Considered

### NgRx (Classic — Actions/Reducers/Effects)

The most popular Angular state management library. Rejected because the application's state is primarily service-scoped and NgRx's boilerplate (actions, reducers, effects, selectors) would be disproportionate to the complexity of the state being managed.

### NgRx Signal Store

A lightweight, signal-based library from the NgRx team (`@ngrx/signals`). Rejected because it introduces an external dependency whose evolution may diverge from Angular's own Signal API roadmap (`resource()`, `linkedSignal`), and the three-layer signal convention provides sufficient encapsulation.

### Pure RxJS (BehaviorSubject-based)

The pre-Signals Angular approach. Rejected because Signals provide better integration with Angular's change detection (especially OnPush), eliminate the need for `async` pipe in templates, and offer a simpler mental model for synchronous state reads. The previous TimeTracker version already demonstrated the benefits of migrating away from this approach.
