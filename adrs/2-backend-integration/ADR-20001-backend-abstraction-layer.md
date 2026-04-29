# Backend Abstraction Layer

- **Status:** accepted
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The previous TimeTracker version already implements a factory-based abstraction (`DatabaseFactory`) that creates service instances for different backends (Supabase, test). The application needs to support potential backend changes — from Supabase to self-hosted PostgREST, or to a completely different backend — without rewriting the entire data access layer. The `DatabaseFactory` in the old project creates services for 9 entity types (`ActivityInfo`, `Task`, `TimeEntry`, `Folder`, `Auth`, `IdleInfo`, `Hostname`, `Options`, `Holidays`).

## Decision

An interface-based backend abstraction layer is adopted, refined from the previous project's `DatabaseFactory` pattern:

- **Service interfaces**: Each data domain defines a TypeScript interface specifying the contract for data operations
- **Implementation swapping**: Concrete implementations (e.g., `SupabaseTaskService`, `PostgrestTaskService`) implement these interfaces
- **Dependency Injection**: Angular's DI system provides the active implementation via `InjectionToken` and provider configuration, replacing the factory function approach
- **Two independent environment axes**: Auth and data are configured separately via `environment.authBackend` and `environment.dataBackend`. They are never collapsed into a single `backend: 'supabase' | 'postgrest'` flag — see ADR-10013 for why this matters when the data layer moves to standalone PostgREST

Interface example:
```typescript
export interface ITaskService {
  getAll(): Promise<TaskEntity[]>;
  getById(id: string): Promise<TaskEntity | null>;
  create(task: Partial<TaskEntity>): Promise<TaskEntity>;
  update(id: string, changes: Partial<TaskEntity>): Promise<TaskEntity>;
  delete(id: string): Promise<void>;
}
```

### Auth axis (`IAuthService`)

`IAuthService` is the interface for the **authentication provider**. It is bound independently of the data services and configured via `environment.authBackend`. Concrete implementations: `SupabaseAuthService` (Hosted Supabase or self-hosted GoTrue), or any other implementation for Path 3 swaps (see ADR-10013).

The auth provider and the data provider can — and sometimes should — point at different infrastructure. A standalone PostgREST data backend (ADR-20003) does not replace the auth provider; it only replaces the data services.

### Data axis (`IXxxService` family)

Interfaces for each data domain, bound via `environment.dataBackend`:

- `ITaskService` — Task CRUD
- `IFolderService` — Folder CRUD + hierarchy
- `ITimeEntryService` — Time entry CRUD + running timer
- `IActivityService` — Activity info CRUD + filtering
- `IIdleInfoService` — Idle period tracking
- `IHostnameService` — Hostname management
- `IOptionsService` — User options
- `IHolidayService` — Holiday management

## Consequences

- Backend can be swapped by changing provider configuration, not consumer code
- Interfaces serve as documentation for what each data domain requires
- Angular's DI provides the implementation at runtime, enabling test mocks via `TestBed`
- Adding a new backend requires implementing all interfaces, which is more work upfront but ensures completeness
- The abstraction adds a layer of indirection — debugging requires understanding which implementation is active
- Improvement over the old project's `DatabaseFactory`: DI-based injection is more Angular-idiomatic and supports tree-shaking

## Alternatives Considered

- **Direct Supabase client usage**: Simplest approach — call Supabase directly from components/providers. Rejected because it creates tight coupling to Supabase across the entire codebase, making backend changes extremely expensive.
- **Factory function (old project pattern)**: The `DatabaseFactory.createXxxService(type)` approach. Rejected in favor of Angular DI because factories bypass Angular's dependency injection, making testing harder and preventing tree-shaking of unused implementations.
- **Repository pattern with ORM**: A more traditional backend abstraction. Rejected because the application does not need a full ORM layer — the service interface is sufficient and avoids ORM overhead in a client-side application.
