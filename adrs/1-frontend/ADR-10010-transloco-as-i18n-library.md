# Transloco as i18n Library

- **Status:** proposed
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The application supports multiple languages (English and German). The previous TimeTracker version uses `@ngx-translate/core`, which is no longer actively maintained and lacks modern Angular features (Signals, standalone support). The MEP reference project (ADR-10006) uses Transloco for internationalization. A modern, actively maintained i18n library is needed that integrates well with Angular's current architecture.

## Decision

`@jsverse/transloco` is adopted as the internationalization library. Key reasons:

- **Actively maintained**: Regular releases aligned with Angular major versions
- **Lazy loading**: Translation files can be loaded per module/route, reducing initial bundle size
- **Multiple scopes**: Supports scoped translations per feature module, avoiding key collisions
- **Structural directive**: `*transloco` directive provides clean template syntax with automatic language switching
- **Testing utilities**: Built-in testing module (`TranslocoTestingModule`) for unit tests
- **Plugin ecosystem**: Scoped translations, locale formatting, message format support

Configuration:
- Translation files in `assets/i18n/` as JSON (`en.json`, `de.json`)
- Default language: `en`
- Available languages: `en`, `de`
- Lazy loading of translation files per route

## Consequences

- Migration from ngx-translate requires updating template pipes (`translate` → `transloco`) and service calls
- Translation file structure may differ from ngx-translate's flat keys
- Scoped translations add flexibility but require understanding the scope resolution mechanism
- Transloco's structural directive (`*transloco="let t"`) is more verbose than a simple pipe but provides better performance (single subscription per template block)

## Alternatives Considered

- **@ngx-translate/core**: The previous project's i18n library. Rejected because it is no longer actively maintained, lacks Angular 21 Signals integration, and the MEP reference project's positive experience with Transloco validates the switch.
- **Angular built-in i18n (xi18n)**: Angular's compile-time i18n solution. Rejected because it requires a separate build per language, which is impractical for an Electron application that needs runtime language switching.
