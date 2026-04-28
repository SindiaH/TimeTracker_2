# Supabase Auth as Authentication Provider

- **Status:** proposed
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
- Session tokens stored securely (Context Isolation in Electron, see ADR-30002)
- Route guards check session state via `SessionProvider`

## Consequences

- Tied to Supabase's auth implementation — switching to a different backend requires replacing the auth layer
- No SSO/SAML/LDAP support without Supabase's enterprise plan
- Session management is handled by Supabase's client library, which auto-refreshes tokens
- The `IAuthService` interface (from ADR-20001) ensures the auth implementation can be swapped if requirements change

## Alternatives Considered

- **Keycloak (OIDC)**: Enterprise-grade identity provider with SSO, SAML, and LDAP support. The MEP reference project uses Keycloak (ADR-50001). Rejected because it requires deploying and maintaining a separate service, which is disproportionate for a personal time tracking application.
- **Firebase Auth**: Similar feature set to Supabase Auth but ties the project to Google's ecosystem. Rejected because the project already uses Supabase for data storage.
- **Custom JWT implementation**: Maximum control but requires implementing token generation, refresh, and validation manually. Rejected due to the security risks of custom auth implementations.
