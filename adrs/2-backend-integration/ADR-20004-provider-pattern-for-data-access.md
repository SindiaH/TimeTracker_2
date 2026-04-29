# Provider Pattern for Data Access

- **Status:** accepted
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The backend abstraction layer (ADR-20001) defines service interfaces for data access. Components should not interact with these services directly — they need higher-level orchestration that manages state (signals), handles loading/error states, applies filters, computes derived data (read models), and prevents race conditions. The previous TimeTracker version uses provider services (e.g., `ActivityProvider`, `TimeEntryProvider`, `SessionProvider`) that sit between components and database services.

## Decision

A **Provider pattern** is adopted as a high-level data access layer between components and database services:

- **Providers** are Angular services that encapsulate a specific data domain
- Each provider:
  1. Injects the corresponding `IXxxService` via DI
  2. Manages domain state as signals (e.g., `taskList`, `isLoading`, `currentFilter`)
  3. Exposes readonly signals to components
  4. Provides methods for data operations (load, create, update, delete)
  5. Computes derived state via `computed()` (e.g., read models with aggregated fields)
  6. Handles side effects via `effect()` (e.g., reload data when filters change)

Provider hierarchy:
```
Component
  └── Provider (state + orchestration)
       └── IXxxService (data access interface)
            └── SupabaseXxxService (implementation)
```

Planned providers:
- `SessionProvider` — Auth session state, login/logout
- `TaskProvider` — Task list, CRUD, task read models
- `FolderProvider` — Folder hierarchy, CRUD, folder read models
- `TimeEntryProvider` — Time entries, running timer, filtering
- `ActivityProvider` — Activities, grouping, hostname filtering
- `SettingsProvider` — Desktop config (Tauri store, see ADR-30006) and user options

## Consequences

- Clear separation: components handle UI, providers handle state + orchestration, services handle data access
- Signals in providers enable OnPush change detection in components
- Providers prevent components from directly coupling to backend service details
- Each provider is testable independently (mock the injected service interface)
- Adds a layer between components and services — more files, but clearer responsibilities
- Race condition handling (request deduplication, optimistic updates) is centralized in providers

## Alternatives Considered

- **Direct service injection in components**: Components inject `ITaskService` directly. Rejected because it pushes state management, loading/error handling, and derived data computation into components, violating separation of concerns.
- **NgRx Store as intermediary**: Centralized store between components and services. Rejected per ADR-10002 — the provider pattern with signals achieves the same goals with less boilerplate.
- **Facade pattern**: Similar to providers but typically wraps multiple services. The provider pattern is simpler — one provider per data domain — and the term "provider" aligns with the existing project's naming.
