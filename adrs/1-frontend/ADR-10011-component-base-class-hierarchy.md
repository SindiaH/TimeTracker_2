# Component Base Class Hierarchy

- **Status:** approved
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

Angular components frequently need shared infrastructure: subscription cleanup on destroy, common injection tokens, and shared utilities. The MEP reference project (ADR-10012) establishes a base class hierarchy that provides this infrastructure. Without base classes, each component must independently handle `OnDestroy` subscription cleanup, leading to boilerplate and potential memory leaks.

## Decision

A two-level base class hierarchy is adopted:

### `ComponentBase`
- Abstract base class for all components
- Provides `DestroyRef` injection and `takeUntilDestroyed()` operator for automatic RxJS subscription cleanup
- Provides shared utility methods available to all components

### `ServiceBase`
- Abstract base class for stateful services (providers)
- Provides `DestroyRef`-based cleanup for services with `providedIn` scope
- Establishes the three-layer signal convention (writable → readonly → observable)

Components and services extend the appropriate base class:

```typescript
@Component({ ... })
export class TasksOverviewComponent extends ComponentBase {
  // Automatic subscription cleanup via takeUntilDestroyed()
}

@Injectable({ providedIn: 'root' })
export class TaskProvider extends ServiceBase {
  // Three-layer signal convention + cleanup
}
```

## Consequences

- Subscription cleanup is handled automatically — eliminates a common source of memory leaks
- Consistent infrastructure across all components and services
- Single inheritance limitation in TypeScript — components cannot extend both `ComponentBase` and another class
- Developers must understand the base class hierarchy and its conventions
- Mixins or composition could complement inheritance where multiple behaviors are needed

## Alternatives Considered

- **No base class (manual cleanup)**: Each component handles its own `takeUntilDestroyed()` or `DestroyRef`. Rejected because it leads to inconsistency and forgotten cleanups, especially in larger teams.
- **Decorator-based approach**: Custom decorators for auto-cleanup. Rejected because decorators are harder to type-check and debug compared to class inheritance.
