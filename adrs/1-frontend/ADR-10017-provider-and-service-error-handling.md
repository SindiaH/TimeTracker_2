# Provider and Service Error Handling via Toast

- **Status:** accepted
- **Date:** 2026-05-09
- **Participants:** Aki

## Context

The provider pattern (ADR-20004) places providers and core services between components and database services. Earlier provider implementations followed a `try/catch → store error in signal → rethrow` pattern, requiring every component caller to wrap each provider call in another `try/catch` and translate the error into a feedback signal local to that component.

This produced three concrete problems:

1. **Duplicated boilerplate**: every component that calls a provider mutation must write the same `try { ... } catch { feedback.set({ kind: 'error', message: ... }) }` block, often with a hand-rolled `toErrorMessage(error)` helper.
2. **Inconsistent UX**: some surfaces show inline banners, some show nothing, and the message wording diverges per call site even though the underlying failure mode (network, RLS denial, validation) is identical.
3. **Dead state**: providers exposed a `lastError` signal that no template ever consumed — its only readers were the providers' own spec files, so it carried zero product value while still demanding writable/readonly/`set(null)` plumbing in every method.

A consistent error surface is needed so that a network failure looks the same whether the user was archiving a task, signing out, or persisting a setting.

## Decision

Providers and core services **must not throw** to their callers. Every error caught inside a provider or service is surfaced through a single application-level toast via `NotificationService`.

**Concrete rules:**

1. **No `throw` from providers or `@core/services/*`.** Every caught error is forwarded to `NotificationService.showError(messageKey, params?)` and then swallowed. Internal invariant violations (e.g. "already mutating") return early instead of throwing.
2. **No more `lastError` signal.** Providers track only the loading/mutation flags that templates actually bind to (`isLoading`, `isAdding`, `isUpdating`, `isDeleting`).
3. **Methods return `Promise<boolean>` for actions whose success/failure the caller acts on** (close a dialog, navigate, reset a form). For methods returning data, use `Promise<T | null>` (`null` = failed). For methods whose result no caller consumes, return `Promise<void>` or — when the provider triggers itself internally — declare them as `void` and start them with `void this.method()`.
4. **`NotificationService` is the only allowed toast surface.** It wraps Angular Material's `MatSnackBar`. Components must not inject `MatSnackBar` directly.
5. **Error message resolution lives in the provider.** Domain-specific error mapping (e.g. `AuthOperationError` → translation key) happens inside the provider, so the toast text is consistent regardless of the caller. Components never look at the underlying `Error`.
6. **Components do not `try/catch` around provider calls.** They branch on the returned boolean / non-null value and run their post-success path; the failure path is already handled (the toast is on screen).

## Consequences

**Easier:**
- Adding a new caller of an existing provider method requires zero error-handling code.
- Error UX is centrally controlled — a future change to toast styling, position, or duration is a one-file change.
- Provider tests no longer need to assert against `lastError`; they assert that `NotificationService.showError` was called with the expected key.
- Components shrink: `try/catch/feedback`-blocks disappear; `isSubmitting` flags can often come straight from the provider.

**Harder:**
- Inline form-level error rendering is no longer free — if a specific surface ever needs an inline error in addition to the toast, that surface must opt in (e.g. with its own local feedback signal driven by the boolean return). This is intentional: the default is "toast only".
- Component callers must remember to branch on the boolean. The compiler does not enforce this. Mitigation: lint review and the `prepare:pr` test suite.
- Programmatic flows that genuinely need to react to a failure mid-flow (chain of dependent calls) must read the returned `false` and abort — they cannot rely on `await` rejecting.

## Alternatives Considered

- **Keep `throw` and let an HTTP-style global error handler render the toast.** Rejected: domain errors (auth, RLS) are not HTTP failures, and a global handler cannot distinguish "this provider already showed a context-specific message" from "this is an unhandled error".
- **`Result<T, E>` return type instead of `Promise<boolean>`.** Rejected: introduces a new abstraction for callers and conflicts with the existing `async/await` style. The boolean / `T | null` convention covers every current call site without ceremony.
- **Keep `lastError` and bind it from a global toast component via `effect()`.** Rejected: every provider would need its own dedicated effect, the toast would fire even when no operation was just attempted (e.g. on app startup), and providers would still carry dead writable state.
- **Throw from providers but swallow in components.** Rejected: identical boilerplate to today, and inverts the rule the user explicitly asked for.
