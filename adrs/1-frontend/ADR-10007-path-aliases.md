# TypeScript Path Aliases for Clean Imports

- **Status:** approved
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

Without path aliases, imports in a nested project structure become deeply relative (`../../../core/services/auth.service`), which is fragile (breaks on file moves) and hard to read. The MEP reference project (ADR-10014) establishes a path alias convention. The previous TimeTracker version does not use path aliases consistently.

## Decision

TypeScript path aliases are configured in `tsconfig.json` to provide short, absolute-style imports:

```json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["src/app/*"],
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@modules/*": ["src/app/modules/*"],
      "@database/*": ["src/app/database/*"],
      "@environments/*": ["src/environments/*"]
    }
  }
}
```

Usage example:
```typescript
import { SessionProvider } from '@core/providers/session.provider';
import { AppButtonComponent } from '@shared/components/button/button.component';
import { TaskEntity } from '@database/entities/task.entity';
```

## Consequences

- Imports are stable across file moves within the same module
- Import paths communicate the architectural layer (core, shared, modules, database)
- IDE auto-imports work with path aliases in VS Code and WebStorm
- Slight initial configuration overhead in `tsconfig.json`
- The Tauri Rust core (`src-tauri/`) is built with `cargo` and does not use these TypeScript aliases at all (see ADR-30001)

## Alternatives Considered

- **Relative imports only**: Simpler configuration but leads to fragile, deeply nested import paths that obscure architectural boundaries.
- **Barrel files (index.ts) per directory**: Provides clean imports but can cause circular dependency issues and prevents tree-shaking in some configurations.
