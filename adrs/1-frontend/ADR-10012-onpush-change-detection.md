# OnPush Change Detection as Default

- **Status:** approved
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

Angular's default change detection strategy (`Default`) checks all components on every change detection cycle, which is inefficient for applications with many components. Signal-based state management (ADR-10002) naturally pairs with `OnPush` change detection, as signals notify Angular precisely when their values change. The MEP reference project uses OnPush as the default.

## Decision

`ChangeDetectionStrategy.OnPush` is adopted as the default change detection strategy for all components:

- **Performance**: OnPush only triggers change detection when input references change or signals are read in the template, skipping unnecessary checks
- **Signal alignment**: Signals automatically mark components dirty when their values change, making OnPush seamless
- **Explicit data flow**: Forces developers to think about when and why components update, leading to more predictable rendering behavior

Angular CLI schematics are configured to generate components with OnPush by default:

```json
{
  "schematics": {
    "@schematics/angular:component": {
      "changeDetection": "OnPush"
    }
  }
}
```

## Consequences

- Significant performance improvement in components with complex templates or many siblings
- Components must use signals, `@Input()` with immutable references, or manual `ChangeDetectorRef.markForCheck()` to trigger updates
- Developers unfamiliar with OnPush may encounter "component not updating" issues until they understand the signal-based pattern
- Template expressions that depend on mutable objects (e.g., `Date.now()`) will not update automatically — must use signals instead

## Alternatives Considered

- **Default change detection strategy**: Simpler mental model but significantly less performant. Creates a bad habit of relying on Angular's exhaustive checking instead of explicit data flow. Since the project uses signals from the start, there is no reason to accept the performance cost.
