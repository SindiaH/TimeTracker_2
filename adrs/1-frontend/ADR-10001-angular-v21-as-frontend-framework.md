# Angular v21+ as Frontend Framework

- **Status:** approved
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

TimeTracker_2 is a rebuild of an existing Electron-based time tracking application. The previous version already uses Angular 21 with Signals, and the team has deep Angular expertise. The application requires complex forms (time entry editing, task management), strict typing, and a clear project structure. A framework is needed that supports both web and desktop deployment targets (the desktop runtime is decided separately in ADR-30001 — Tauri 2), provides a robust component model, and integrates well with desktop application requirements.

## Decision

Angular version 21 or later is adopted as the frontend framework. Key reasons:

- **Continuity**: The existing TimeTracker project already uses Angular 21, so the rebuild can leverage existing domain knowledge and component patterns
- **Signal-based reactivity**: Signals fully replace Zone.js, resulting in better performance and simpler change detection — aligning with the MEP reference architecture
- **Typing**: End-to-end TypeScript integration with strict mode ensures type safety across the application
- **Enterprise readiness**: Built-in routing, dependency injection, HTTP client, and Reactive Forms reduce the need for third-party libraries
- **Desktop compatibility**: Angular's build system (esbuild/Vite) produces a static SPA bundle that the chosen desktop runtime (Tauri 2, see ADR-30001) loads into a system WebView without modification
- **Long-term support**: Google's LTS strategy provides planning stability

## Consequences

- Build tooling is based on esbuild/Vite, enabling fast builds and HMR
- Angular's strict project structure simplifies maintenance and onboarding
- Dependency on Google's release cycle and breaking changes in major updates
- RxJS remains available for complex asynchronous flows (HTTP interceptors, guards) but is no longer the primary reactivity model
- The team can reuse patterns and learnings from the MEP reference project
- The same Angular bundle is consumed by both the web build and the Tauri 2 desktop shell (see ADR-30001) — no Angular-side branching is required

## Alternatives Considered

- **React 19+**: Larger ecosystem but less structure out-of-the-box. Would require many third-party libraries for routing, forms, and state management. The team's primary expertise is in Angular.
- **Svelte / SolidJS on Tauri**: Smaller bundles and finer-grained reactivity than Angular, and they integrate with Tauri 2 (the chosen desktop runtime, ADR-30001) just as well as Angular does. Rejected because the team has no Svelte/Solid expertise and the existing TimeTracker codebase — including the Reactive Forms layer, the Signal-based providers, and the shared component conventions — is already Angular. Switching framework on top of switching desktop runtime would multiply migration risk for no proportionate benefit.
