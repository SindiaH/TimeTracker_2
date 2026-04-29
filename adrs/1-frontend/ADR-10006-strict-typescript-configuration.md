# Strict TypeScript Configuration

- **Status:** accepted
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

TypeScript's strict mode flags catch entire categories of bugs at compile time — null reference errors, implicit `any` types, unchecked index access. The previous TimeTracker version uses TypeScript but not all strict flags are enabled. The MEP reference project enforces strict mode across the entire codebase.

## Decision

TypeScript strict mode is enabled with all sub-flags active:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  },
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

Additionally, Angular's template strict checking is enabled to catch type errors in HTML templates at compile time.

## Consequences

- Catches null/undefined errors, implicit `any` usage, and template binding mismatches at compile time
- Forces explicit type annotations where inference is insufficient
- `strictNullChecks` requires handling `null | undefined` cases explicitly, which adds verbosity but prevents runtime errors
- Angular's `strictTemplates` catches binding errors in templates that would otherwise only surface at runtime
- Existing code from the old project may need type annotations added during migration
- Third-party library typings may occasionally conflict with strict mode, requiring type assertions

## Alternatives Considered

- **Relaxed TypeScript (no strict mode)**: Faster initial development but leads to type-related bugs in production. The previous project experienced issues that strict mode would have caught at compile time.
- **Gradual strictness (enable flags incrementally)**: Delays the benefits and creates inconsistency across the codebase. Since this is a greenfield rebuild, strict mode can be enabled from day one without migration cost.
