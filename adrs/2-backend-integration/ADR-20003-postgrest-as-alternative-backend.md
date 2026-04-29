# PostgREST as Alternative Backend Implementation

- **Status:** accepted
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The backend abstraction layer (ADR-20001) enables swapping backend implementations. While Supabase is the primary backend (ADR-20002), its hosted service may not be suitable for all deployment scenarios — self-hosted environments, air-gapped networks, or cost optimization. PostgREST is the REST API layer that Supabase itself uses internally, making it a natural alternative for self-hosted deployments.

## Decision

PostgREST is documented as an alternative backend implementation for self-hosted deployments:

- **PostgREST**: Standalone REST API server that auto-generates endpoints from a PostgreSQL schema
- **Same API surface**: Since Supabase uses PostgREST internally, the REST API is identical — minimizing implementation differences
- **Self-hosted**: Runs as a single binary alongside PostgreSQL, without Supabase's additional services (Edge Functions, Storage, etc.)
- **JWT-based auth**: PostgREST validates JWT tokens and uses PostgreSQL Row-Level Security, same as Supabase

Implementation:
- `PostgrestTaskService implements ITaskService`
- `PostgrestFolderService implements IFolderService`
- `PostgrestTimeEntryService implements ITimeEntryService`
- Uses `postgrest-js` client or direct HTTP calls
- Bound via `environment.dataBackend` — auth remains separately configured via `environment.authBackend` (ADR-20001)

PostgREST is **not** an auth provider — it validates JWTs against a configured secret and enforces RLS, but does not issue tokens. The auth provider must be chosen independently; see ADR-10013 (Backend Swap Scenarios) for the three viable paths. The recommended starting point is Path 1 (keep Supabase Auth / GoTrue, swap only the data services), which requires zero Angular changes beyond the `environment.dataBackend` URL.

This ADR documents the option — implementation is deferred until needed.

## Consequences

- Provides a migration path away from Supabase's hosted service without changing the data model or RLS policies
- PostgREST is a mature, battle-tested project (used by Supabase itself)
- Auth must be handled separately (no built-in Supabase Auth) — requires an external JWT issuer or custom auth service
- No Supabase Dashboard, Edge Functions, or Storage — only the REST API
- Reduces operational cost for self-hosted deployments

## Alternatives Considered

- **Hasura**: GraphQL engine over PostgreSQL. Rejected because the application uses REST (not GraphQL) and adding Hasura would change the API paradigm.
- **Custom Express/Fastify API**: Maximum flexibility but requires writing and maintaining all endpoints manually. PostgREST auto-generates endpoints from the schema, which is sufficient for CRUD operations.
