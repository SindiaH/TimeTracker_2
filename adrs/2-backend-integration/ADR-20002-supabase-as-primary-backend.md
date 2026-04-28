# Supabase as Primary Backend Implementation

- **Status:** proposed
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The application needs a backend that provides database storage, real-time capabilities, authentication, and Row-Level Security for per-user data isolation. The previous TimeTracker version uses Supabase successfully as its backend. The backend abstraction layer (ADR-20001) allows the backend implementation to be swapped, but an initial implementation is needed.

## Decision

Supabase is adopted as the primary backend implementation. Key reasons:

- **Proven**: The previous TimeTracker version demonstrates Supabase's suitability for this use case
- **All-in-one**: Database (PostgreSQL), authentication, storage, and auto-generated REST API in a single service
- **Row-Level Security**: Built-in per-user data isolation at the database level, enforced by auth tokens
- **Auto-generated API**: PostgREST provides REST endpoints for all tables without writing backend code
- **Hosted or self-hosted**: Supabase can be used as a hosted service or self-hosted via Docker
- **Client library**: `@supabase/supabase-js` provides a typed TypeScript client

Implementation details:
- `SupabaseTaskService implements ITaskService`
- `SupabaseFolderService implements IFolderService`
- `SupabaseTimeEntryService implements ITimeEntryService`
- `SupabaseActivityService implements IActivityService`
- etc.
- Singleton Supabase client instance (`CustomSupabaseInstance`)
- Response wrappers (`SupabaseResponseModel<T>`, `SupabaseListResponseModel<T>`) for consistent error handling

## Consequences

- Vendor dependency on Supabase (mitigated by the abstraction layer and self-hosting option)
- No custom backend logic — all business logic runs in the frontend or as PostgreSQL functions
- Real-time subscriptions available for future features (live collaboration, multi-device sync)
- Free tier is sufficient for personal use; paid plans for team usage
- The abstraction layer (ADR-20001) ensures migration to PostgREST or another backend is possible

## Alternatives Considered

- **Firebase**: Google's BaaS offering. Rejected because it uses a proprietary NoSQL database (Firestore) instead of PostgreSQL, limiting query flexibility and making self-hosting impossible.
- **Self-hosted PostgreSQL + custom API**: Maximum control but requires building and maintaining authentication, API endpoints, and deployment infrastructure. Disproportionate effort for a time tracking application.
- **Appwrite**: Open-source BaaS alternative. Less mature than Supabase, smaller community, and the team has no experience with it.
