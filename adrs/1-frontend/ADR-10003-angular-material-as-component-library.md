# Angular Material as UI Component Library

- **Status:** accepted
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The application requires a comprehensive set of UI components: buttons, inputs, selects, date pickers, dialogs, tabs, expansion panels, menus, tooltips, and more. The previous TimeTracker version uses Angular Material and has 35+ shared components wrapping Material Design components. The MEP reference project also uses Angular Material (ADR-10005) with a `BaseComponentsModule` pattern. Building all components from scratch would be time-consuming and error-prone, especially for accessibility.

## Decision

Angular Material (`@angular/material`) is adopted as the UI component library, wrapped in a `BaseComponentsModule` that provides project-specific abstractions:

- **Consistent API**: Base components (e.g., `AppButtonComponent`, `AppInputComponent`) wrap Material components with project-specific defaults, reducing boilerplate in feature modules
- **Accessibility**: Material components provide ARIA attributes and keyboard navigation out of the box
- **Theming**: Material's theming system supports custom color palettes and dark mode
- **Migration path**: The previous project's shared components can be adapted rather than rewritten from scratch
- **BaseComponentsModule**: Declares and exports all base components, imported via `SharedModule`

The base component set includes:
- Form: Button, Input, Select, Checkbox, DatePicker, DateRangePicker, ColorPicker, ToggleGroup
- Layout: Dialog, Tabs, ExpansionPanel, Menu
- Display: Icon, Spinner, Tooltip, ProgressIndicator

## Consequences

- Large library — increases bundle size, but tree-shaking and lazy loading mitigate this
- Material Design aesthetic may not match every design requirement — custom theming and component overrides are needed
- Upgrading Angular Material requires matching the Angular version
- Base component wrappers add a layer of indirection but provide a consistent API and a single point of change for styling/behavior updates

## Alternatives Considered

- **PrimeNG**: Feature-rich but opinionated styling that's harder to customize. Larger bundle and less alignment with Angular's design philosophy.
- **Custom components from scratch**: Maximum flexibility but requires significant effort for accessibility, keyboard navigation, and cross-browser testing. Not justified for standard form controls.
- **Tailwind UI / Headless UI**: Headless approach offers styling freedom but requires building all component behavior manually. No Angular-native headless library has the maturity of Material.
