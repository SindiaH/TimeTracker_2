# Transloco as i18n Library

- **Status:** accepted
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The application supports multiple languages (English and German). The previous TimeTracker version uses `@ngx-translate/core`, which is no longer actively maintained and lacks modern Angular features (Signals, standalone support). The MEP reference project (ADR-10006) uses Transloco for internationalization. A modern, actively maintained i18n library is needed that integrates well with Angular's current architecture.

The MEP reference project (`BrandspotHubApp/src/app/core/i18n/translation.service.ts`) wraps its underlying i18n library in a single `TranslationService` instead of having components and services depend on `TranslateService` directly. That pattern keeps the chosen library swappable, hides cookie/persistence and locale-registration plumbing behind a small typed surface, and gives every consumer one place to import from. TimeTracker_2 inherits this pattern so the same swappability and discoverability apply here.

## Decision

`@jsverse/transloco` is adopted as the internationalization library. Key reasons:

- **Actively maintained**: Regular releases aligned with Angular major versions
- **Lazy loading**: Translation files can be loaded per module/route, reducing initial bundle size
- **Multiple scopes**: Supports scoped translations per feature module, avoiding key collisions
- **Structural directive**: `*transloco` directive provides clean template syntax with automatic language switching
- **Testing utilities**: Built-in testing module (`TranslocoTestingModule`) for unit tests
- **Plugin ecosystem**: Scoped translations, locale formatting, message format support

Configuration:
- Translation files in `assets/i18n/` as JSON (`en-US.json`, `de-AT.json`)
- Default language: `en-US`
- Available languages: `en-US`, `de-AT`
- Lazy loading of translation files per route

### Encapsulation in `TranslationService` and `TranslatePipe`

All Transloco usage in application code MUST go through a single `TranslationService` (`src/app/core/i18n/translation.service.ts`) for programmatic access and a single `TranslatePipe` (`src/app/core/i18n/translate.pipe.ts`) for templates. Both are modelled on the MEP reference project's `TranslationService`. No component, provider, guard, directive, or other service is allowed to inject `TranslocoService` or import `TranslocoPipe`/`TranslocoDirective` directly — `TranslationService` and `TranslatePipe` are the only consumers of the underlying library.

The service responsibilities are:

- **Owning the active language** as a signal — `selectedLanguageId = signal<string>('')` plus a public `selectedLanguageId$ = this.selectedLanguageId.asReadonly()`, following the three-layer signal convention (ADR-10002).
- **Registering available languages** (`en-US`, `de-AT` initially) with Transloco at bootstrap and registering the matching `@angular/common/locales/*` data via `registerLocaleData(...)` so date/number pipes work without per-call locale arguments.
- **Persisting and restoring the user's language choice**:
  - Web target: `localStorage` key `time-tracker-language` (the cookie-based persistence used in the MEP reference is not appropriate for a desktop app — there is no shared parent domain).
  - Desktop target: mirrored into the Tauri store (`tauri-plugin-store`, see ADR-30006) so the choice survives a fresh OS user profile that wipes the WebView's localStorage. Read priority on launch: Tauri store → localStorage → fallback language.
- **Exposing a small, typed API** that matches the MEP reference where applicable:
  - `setLanguage(langId: string): void`
  - `getSelectedLanguageId(): string`
  - `loadTranslations(...locales: Locale[]): void` for runtime extension (used by lazy-loaded scopes that need to push their bundle into the active translation map)
  - `instant(key: string | string[], params?: HashMap): string` as a thin pass-through for places where Transloco's pipe/directive is not usable (e.g., inside a service)
  - `selectTranslate(key: string, params?: HashMap): Observable<string>` for reactive consumers (mostly RxJS-heavy code paths like guards or interceptors)
- **Writing the active language onto `document.documentElement.lang`** whenever it changes (effect on `selectedLanguageId`), so screen readers and Material's locale-dependent components see the correct value.

### Templates use `TranslatePipe` only

Templates MUST use the project's own `TranslatePipe` (selector `translate`), exported via `SharedModule`:

```html
<span>{{ 'app.title' | translate }}</span>
<p>{{ 'modules.stubMessage' | translate: { moduleName } }}</p>
```

`TranslatePipe` is a thin `pure: false` wrapper that injects `TranslationService`, subscribes to `selectTranslate(key, params)` (which re-emits on language change), and calls `cdr.markForCheck()` so the host component updates under OnPush. It is the only pipe permitted for translations.

Transloco's own `transloco` pipe and `*transloco="let t"` structural directive are **not** used in this project. The directive's per-block subscription benefit is small at this scale, and re-exporting Transloco surface from `SharedModule` would defeat the encapsulation goal — every template would otherwise depend on `@jsverse/transloco` transitively.

Components MUST NOT import `TranslocoService`, `TranslocoPipe`, or `TranslocoDirective`. Language switching and current-language reads go through `TranslationService`; in-template translations go through `TranslatePipe`.

## Consequences

- Migration from ngx-translate requires updating template pipes (`translate` ngx → `translate` project pipe) and service calls; the pipe selector happens to match, but the implementation, params shape, and re-render mechanism are different.
- Translation file structure may differ from ngx-translate's flat keys
- Scoped translations add flexibility but require understanding the scope resolution mechanism
- Choosing pipe-only over Transloco's structural directive trades a small per-template-block subscription win for a much smaller public surface (one project pipe instead of two Transloco constructs).
- **Single boundary for the i18n library**: Replacing Transloco later (or upgrading across a breaking major) only touches `TranslationService` and `TranslatePipe` — no fan-out across feature modules or templates.
- **Thin wrapper, real cost**: `TranslationService` and `TranslatePipe` add one indirection each over the Transloco API. The cost is justified by the swappability and the central place to put persistence, locale registration, and Tauri-store mirroring.
- **Lint guardrail**: An ESLint `no-restricted-imports` rule forbids importing from `@jsverse/transloco` anywhere outside `src/app/core/i18n/` so the encapsulation cannot drift silently in PR review.

## Alternatives Considered

- **@ngx-translate/core**: The previous project's i18n library. Rejected because it is no longer actively maintained, lacks Angular 21 Signals integration, and the MEP reference project's positive experience with Transloco validates the switch.
- **Angular built-in i18n (xi18n)**: Angular's compile-time i18n solution. Rejected because it requires a separate build per language, which is impractical for a Tauri-packaged desktop application (see ADR-30001) that needs runtime language switching without producing one binary per locale.
