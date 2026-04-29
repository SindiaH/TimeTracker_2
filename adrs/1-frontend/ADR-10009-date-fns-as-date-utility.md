# date-fns as Date Utility Library

- **Status:** accepted
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The application performs extensive date/time operations: duration calculations, date formatting, date range comparisons, calendar grid generation, and time entry positioning. The previous TimeTracker version already migrated from `moment.js` to `date-fns 4.1`. A date utility library is needed that is tree-shakeable, immutable, and supports the required operations without excessive bundle size.

## Decision

`date-fns` is adopted as the date utility library. Key reasons:

- **Tree-shakeable**: Only imported functions are included in the bundle, unlike moment.js which ships as a monolithic package
- **Immutable**: All functions return new `Date` objects, preventing mutation bugs
- **Native Date**: Works with native JavaScript `Date` objects, no wrapper types
- **Comprehensive API**: Covers all required operations — `format`, `differenceInMinutes`, `startOfDay`, `endOfDay`, `isWithinInterval`, `addHours`, `parseISO`, etc.
- **Continuity**: The previous project already uses date-fns, so existing date logic can be carried over
- **Locale support**: Built-in locales for i18n date formatting (de, en-US, etc.)

## Consequences

- No global configuration — locale and formatting options must be passed per function call (or wrapped in project-specific utilities)
- Tree-shaking keeps the bundle lean — only used functions are included
- Native `Date` objects avoid serialization issues with JSON APIs
- TypeScript types are first-class
- Duration formatting requires manual composition (date-fns does not have a built-in duration formatter like `moment.duration().humanize()`)

## Alternatives Considered

- **moment.js**: The previous project's original choice. Rejected because it is deprecated, not tree-shakeable (adds ~70KB gzipped), and uses mutable objects.
- **Luxon**: moment.js successor by the same team. Rejected because it uses custom `DateTime` wrapper objects instead of native `Date`, and the API is less ergonomic for functional composition.
- **Temporal API (TC39)**: The upcoming native JavaScript date/time API. Not yet widely available in all target runtimes and lacks library ecosystem support. Can be adopted later when stable.
