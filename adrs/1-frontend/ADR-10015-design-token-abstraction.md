# Design Token Abstraction over Material System Tokens

- **Status:** accepted
- **Date:** 2026-05-01
- **Participants:** Aki

## Context

ADR-10014 established Angular Material M3 theming with two scoped themes and required all component SCSS to consume CSS custom properties rather than hard-coded hex values. The original guidance allowed components to read Material's `--mat-sys-*` system tokens (e.g., `var(--mat-sys-surface)`, `var(--mat-sys-on-surface)`) directly. As the component library grew (base components, shared components, showcase sections), three drawbacks emerged:

- **Vendor lock-in across the component tree.** Every SCSS file naming `--mat-sys-*` couples the component to Material's M3 token vocabulary. A future migration off Angular Material — or even a major M3 token rename within Material — would touch dozens of files.
- **No semantic indirection.** Material's role names (`surface-container-high`, `on-tertiary-container`, …) describe Material's role taxonomy, not the application's design intent. There is no project-level layer where, e.g., "panel background" can be remapped without searching every consumer.
- **Inconsistent with the MEP reference.** The reference project (`BrandspotHubApp`) keeps a global `src/assets/scss/variables/` folder with `_colors.scss`, `_typography.scss`, `_variables.scss`, and components consume those project-owned tokens. TimeTracker_2 had drifted from that pattern by exposing the underlying library tokens directly to components.

Constraints:

- The abstraction MUST preserve automatic light/dark theme switching established by ADR-10014. Components must not need to branch on the active theme.
- The abstraction MUST NOT add a build step or a SCSS function/mixin layer that obscures the cascade — runtime CSS custom properties must remain the mechanism, so `prefers-color-scheme` and `.theme-*` classes continue to work transparently.
- The abstraction MUST be enforceable. A linter rule or, at minimum, an unambiguous, mechanically checkable convention is required so that "no `--mat-*` in components" is not a code-review-only rule.
- The set of tokens MUST cover the existing call sites (colour, typography, shape) without inflating to a token registry that mirrors every Material token that exists.

## Decision

A thin token-mapping layer sits between Angular Material's system tokens and the rest of the application. Components and pages consume only project-owned `--app-*` custom properties; the mapping to `--mat-sys-*` lives in three partials under `src/styles/variables/`.

### File layout

```
src/styles/
  _theme.scss                  # Material theme inclusion + theme-scoped --app-* tokens
  themes/
    _light-theme.scss
    _dark-theme.scss
  variables/
    _palette.scss              # M3 palette config (existing)
    _colors.scss               # NEW — --app-color-* ← --mat-sys-*
    _typography.scss           # NEW — --app-typography-* ← --mat-sys-*
    _shape.scss                # NEW — --app-shape-* ← --mat-sys-*
```

`_theme.scss` `@use`s the three new partials so they emit into the global stylesheet exactly once.

### Mapping pattern

Each token partial declares CSS custom properties on `:root` whose values are `var(--mat-sys-…)` references. Because `--mat-sys-*` is itself re-emitted under `:root, .theme-light` and `.theme-dark` by Material's theme include, the indirection cascades automatically — switching the `.theme-*` class continues to flip every `--app-*` token without any extra wiring. Example:

```scss
:root {
  --app-color-surface: var(--mat-sys-surface);
  --app-color-on-surface: var(--mat-sys-on-surface);
  --app-color-primary: var(--mat-sys-primary);
  // …
}
```

### Naming convention

`--app-<category>-<role>`:

- `--app-color-*` for surface, on-surface, container, primary, error, outline, etc.
- `--app-typography-*` for `body-medium`, `title-medium`, `headline-medium`, and individual size tokens such as `body-large-size`.
- `--app-shape-*` for corner-radius scale (`corner-medium`, …).

The `<role>` segment mirrors the Material M3 role name to keep the mapping unambiguous and to avoid inventing a parallel design vocabulary the team would have to learn.

### Theme-scoped project tokens

Tokens that require explicit hex values per theme (because no Material role expresses the intent) — `--app-tracker-running`, `--app-tracker-idle`, `--app-day-grid-line`, `--app-day-grid-line-strong`, `--app-activity-block-border` — remain declared inside the `:root, .theme-light` and `.theme-dark` selectors of `src/styles/_theme.scss`. They live next to the Material theme include because they are part of the theme definition, not a Material token re-export.

### Hard rule

Direct `--mat-*` references are forbidden everywhere except the three mapping partials in `src/styles/variables/`. This rule is documented in `CLAUDE.md` (Styling Rules section) and ADR-10014, and is verified during code review. If a component needs a Material role that is not yet mapped, the contributor MUST extend the relevant partial first and consume the new `--app-*` token from the component — never the other way around.

## Consequences

- **Single rename surface.** A Material M3 token rename or a future move off Material requires editing only `_colors.scss` / `_typography.scss` / `_shape.scss`. Every component continues to compile against `--app-*`.
- **Project-level intent is named.** "What does the panel use?" answers `--app-color-surface`, not `--mat-sys-surface`. Future renames toward more intent-revealing names (e.g., `--app-color-panel-bg`) become a non-breaking change inside the partial.
- **Consistency with the MEP reference.** TimeTracker_2 now follows the same pattern as `BrandspotHubApp`'s `src/assets/scss/variables/` folder — globally available, project-owned tokens.
- **Enforcement is currently a rule, not a lint.** Stylelint does not have a built-in rule that forbids substring matches inside `var(...)` values across all properties. Adding a custom Stylelint plugin or a `declaration-property-value-disallowed-list` regex on the `_colors.scss`/`_typography.scss`/`_shape.scss` exception is a follow-up. Until then, code review and the CLAUDE.md rule are the gate.
- **Token surface grows on demand.** The initial set covers exactly the tokens used by the codebase as of this ADR. New mappings are added when a new component needs them. There is no attempt to proactively re-export Material's full token catalogue.
- **Test gate.** After this ADR is applied, the user manually verifies the app in light, dark, and follow-system modes (browser and Tauri) before any feature is built on top of the new token surface.

## Alternatives Considered

- **Continue allowing `--mat-sys-*` in components.** Status quo from ADR-10014's first iteration. Rejected — it leaves no project-level rename surface and couples every component to Material's vocabulary.
- **SCSS variables/mixins instead of CSS custom properties.** Build-time substitution would let us hide Material entirely behind SCSS function calls. Rejected — it breaks the runtime `.theme-*` switch, since SCSS values are baked into the bundle and cannot read the active theme class.
- **A single flat `_tokens.scss` partial.** Marginally simpler. Rejected — splitting by category (colour / typography / shape) keeps each partial readable as the token surface grows and matches the BrandspotHubApp layout.
- **Re-export every `--mat-sys-*` token defensively.** Rejected — the unused tokens become noise, and every Material upgrade silently grows the surface area we maintain. Map only what is actually consumed.
