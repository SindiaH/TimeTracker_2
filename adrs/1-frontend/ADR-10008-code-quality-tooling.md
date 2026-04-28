# Code Quality Tooling

- **Status:** proposed
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

Consistent code quality requires automated tooling for linting, formatting, and pre-commit validation. The previous TimeTracker version uses ESLint and Prettier. The MEP reference project uses Biome (ADR-10002) as an all-in-one solution, but for the TimeTracker rebuild, the established ESLint + Prettier combination is preferred due to broader Angular ecosystem support and the availability of `angular-eslint` rules.

## Decision

The following code quality tools are adopted:

- **ESLint** with `@angular-eslint`: Angular-specific linting rules (component best practices, lifecycle hooks, template accessibility)
- **Prettier**: Opinionated code formatting for TypeScript, HTML, SCSS, JSON, and Markdown
- **Stylelint**: SCSS-specific linting (see ADR-10004)
- **Husky + lint-staged**: Pre-commit hooks that run ESLint and Prettier on staged files, preventing unformatted or linting-error code from being committed

Configuration:
- ESLint and Prettier configs at project root
- `lint-staged` runs on `*.{ts,html,scss,json,md}`
- CI pipeline runs full lint check

## Consequences

- Consistent code style across the entire codebase without manual enforcement
- Pre-commit hooks catch issues before they reach the repository
- ESLint + angular-eslint provides Angular-specific rules that Biome does not support
- Multiple tools to configure and maintain (ESLint, Prettier, Stylelint, Husky)
- Occasional formatting conflicts between ESLint and Prettier require `eslint-config-prettier`

## Alternatives Considered

- **Biome**: All-in-one linter and formatter (used in MEP reference). Rejected because Biome lacks Angular-specific rules (`@angular-eslint`) and HTML template linting support, which are important for an Angular project.
- **No pre-commit hooks**: Relies on CI to catch issues. Rejected because it delays feedback and leads to noisy fix-up commits.
