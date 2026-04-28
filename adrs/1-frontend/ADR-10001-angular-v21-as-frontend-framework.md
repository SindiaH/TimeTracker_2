# Angular v21+ as Frontend Framework

- **Status:** proposed
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

TimeTracker_2 is a rebuild of an existing Electron-based time tracking application. The previous version already uses Angular 21 with Signals, and the team has deep Angular expertise. The application requires complex forms (time entry editing, task management), strict typing, and a clear project structure. A framework is needed that supports both web and Electron deployment targets, provides a robust component model, and integrates well with desktop application requirements.

## Decision

Angular version 21 or later is adopted as the frontend framework. Key reasons:

- **Continuity**: The existing TimeTracker project already uses Angular 21, so the rebuild can leverage existing domain knowledge and component patterns
- **Signal-based reactivity**: Signals fully replace Zone.js, resulting in better performance and simpler change detection — aligning with the MEP reference architecture
- **Typing**: End-to-end TypeScript integration with strict mode ensures type safety across the application
- **Enterprise readiness**: Built-in routing, dependency injection, HTTP client, and Reactive Forms reduce the need for third-party libraries
- **Electron compatibility**: Angular's build system (esbuild/Vite) works well with Electron's renderer process
- **Long-term support**: Google's LTS strategy provides planning stability

## Consequences

- Build tooling is based on esbuild/Vite, enabling fast builds and HMR
- Angular's strict project structure simplifies maintenance and onboarding
- Dependency on Google's release cycle and breaking changes in major updates
- RxJS remains available for complex asynchronous flows (HTTP interceptors, guards) but is no longer the primary reactivity model
- The team can reuse patterns and learnings from the MEP reference project

## Alternatives Considered

- **React 19+**: Larger ecosystem but less structure out-of-the-box. Would require many third-party libraries for routing, forms, and state management. The team's primary expertise is in Angular.
- **Tauri + Svelte/SolidJS**: Tauri offers a smaller binary size than Electron, but the existing project's Electron-specific features (active window monitoring, native utilities) are deeply tied to Electron's Node.js integration. Switching both framework and runtime would multiply migration risk.
