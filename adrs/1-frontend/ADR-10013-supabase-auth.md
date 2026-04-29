# Supabase Auth as Authentication Provider

- **Status:** accepted
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The application requires user authentication with email/password login, passwordless login (magic links), password reset, and session persistence. The previous TimeTracker version uses Supabase Auth successfully. The application is a personal/small-team tool, not an enterprise multi-tenant system, so a lightweight auth solution is preferred over a full identity provider like Keycloak.

## Decision

Supabase Auth is retained as the authentication provider. Key reasons:

- **Proven**: The previous TimeTracker version demonstrates that Supabase Auth meets all authentication requirements
- **Feature-complete for scope**: Email/password, magic links, password reset, and session management are built-in
- **Integrated with backend**: Since Supabase is the primary backend (ADR-20002), using its auth system avoids token translation between separate auth and data services
- **Row-Level Security**: Supabase Auth tokens integrate directly with PostgreSQL Row-Level Security policies, enabling per-user data isolation at the database level
- **Minimal infrastructure**: No separate identity provider to deploy and maintain

Integration pattern:
- `SessionProvider` wraps Supabase Auth with signals (session state, loading state)
- `AuthService` implements `IAuthService` interface for backend abstraction
- Session tokens stored securely — the Tauri renderer has no ambient OS access (capability-based ACL, see ADR-30002), so an XSS in the Angular bundle cannot exfiltrate tokens via `fs`/`shell`/`process` the way it could under the legacy Electron `nodeIntegration: true` configuration
- Route guards check session state via `SessionProvider`

## Backend Swap Scenarios

Auth and data are **two independent axes** in the backend abstraction (ADR-20001) — not one bundled `backend: 'supabase' | 'postgrest'` switch. Each is selected by its own environment flag (`environment.authBackend` and `environment.dataBackend`), so the auth provider and the data provider can be configured separately. This matters because PostgREST (ADR-20003) is *not* an auth provider — it only validates JWTs and uses them in PostgreSQL Row-Level Security; it does not issue them. Whenever the data layer moves off Supabase, the auth layer must be re-decided independently.

The three viable swap paths, sorted by required rework:

### 1. Data-only swap (zero Angular rework)

Keep Supabase Auth (hosted or self-hosted GoTrue). Swap only the `IXxxService` implementations from `Supabase*Service` to `Postgrest*Service`. Both layers share the same JWT secret, so a JWT issued by GoTrue is accepted by a standalone PostgREST server in RLS without translation. `SupabaseAuthService implements IAuthService` stays in place; `SessionProvider` and route guards do not change.

This is the recommended path when the motivation is "I want my data on my own PostgreSQL but keep Supabase doing what it does well." It is the minimal-rework option.

### 2. Auth-only swap to self-hosted GoTrue (small infrastructure delta)

Stand up GoTrue (Supabase's MIT-licensed auth server) on the same host as PostgREST. The Angular client continues to use `gotrue-js` (or the `auth` subset of `@supabase/supabase-js`), pointed at the self-hosted GoTrue URL via `environment.authBackend.url`. `SupabaseAuthService` is renamed `GotrueAuthService` for clarity, but the body is essentially unchanged — same protocols, same token format.

Use this path when the operational requirement is "no dependency on supabase.com" but the feature set (email/password, magic links, password reset) should stay identical.

### 3. Different auth provider (real refactor)

Switching to Keycloak / Authelia / OIDC / a custom JWT issuer means a new `IAuthService` implementation (`KeycloakAuthService`, `OidcAuthService`, …). The login flows differ (OIDC redirect vs. magic-link in-app), the token storage may differ (refresh-token rotation semantics), and Tauri deep-link handling for the OIDC redirect needs to be wired through `DesktopService` (see ADR-30008). The `IAuthService` interface protects every consumer (components, route guards, `SessionProvider`) — they do not change — but the implementation behind the interface is rewritten.

Use this path when SSO/SAML/LDAP is required, or when a corporate identity provider is mandated.

### Implication for the abstraction

`IAuthService` and the `IXxxService` family must remain **independently swappable**. Concretely:

- Two environment fields, not one: `environment.authBackend` and `environment.dataBackend`, each with its own URL/key configuration.
- No code path treats "Supabase" as a single backend — `SupabaseAuthService` and `SupabaseTaskService` are separate provider bindings, even though they wrap the same client library.
- The Supabase JS client instance is split: one instance for `auth`, one for `from(...)`. They can point at different URLs.

## Consequences

- Tied to Supabase's auth implementation by default — but the abstraction (above) ensures only the auth implementation, not the consumers, is replaced when the auth backend changes
- No SSO/SAML/LDAP support without Supabase's enterprise plan or Path 3 above
- Session management is handled by Supabase's client library, which auto-refreshes tokens
- The `IAuthService` interface (from ADR-20001) ensures the auth implementation can be swapped if requirements change
- **Auth and data are configured separately**: Two environment flags, two provider bindings. A future "data on PostgREST, auth on Supabase" deployment is a configuration change, not a code change.

## Alternatives Considered

- **Keycloak (OIDC)**: Enterprise-grade identity provider with SSO, SAML, and LDAP support. The MEP reference project uses Keycloak (ADR-50001). Rejected because it requires deploying and maintaining a separate service, which is disproportionate for a personal time tracking application.
- **Firebase Auth**: Similar feature set to Supabase Auth but ties the project to Google's ecosystem. Rejected because the project already uses Supabase for data storage.
- **Custom JWT implementation**: Maximum control but requires implementing token generation, refresh, and validation manually. Rejected due to the security risks of custom auth implementations.
