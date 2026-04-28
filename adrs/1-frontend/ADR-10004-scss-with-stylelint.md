# SCSS with Stylelint as Styling Approach

- **Status:** proposed
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The application needs a styling approach that supports component-scoped styles, theming (Angular Material), and maintainability. The previous TimeTracker version uses SCSS with global styles in `src/styles/`. The MEP reference project also uses SCSS (ADR-10009) with Stylelint (ADR-10016) for linting.

## Decision

SCSS is adopted as the styling language with Stylelint for automated linting:

- **SCSS**: Angular's default CSS preprocessor with built-in support for variables, mixins, nesting, and partials
- **Component-scoped styles**: Angular's `ViewEncapsulation.Emulated` (default) scopes styles per component
- **Global styles**: Shared variables, mixins, and Material theme configuration in `src/styles/`
- **Stylelint**: Enforces consistent formatting, property ordering, and naming conventions

## Consequences

- SCSS is well-understood by the team and fully supported by Angular CLI
- Stylelint catches common CSS issues early (invalid properties, inconsistent units, nesting depth)
- Angular Material's theming system is SCSS-native, making integration seamless
- No additional build tooling needed — Angular CLI handles SCSS compilation

## Alternatives Considered

- **Tailwind CSS**: Utility-first approach offers rapid prototyping but conflicts with Angular Material's theming system and component-scoped styles. Mixing utility classes with Material's SCSS theming creates inconsistency.
- **Plain CSS**: Lacks variables, mixins, and nesting features that improve maintainability in larger projects.
