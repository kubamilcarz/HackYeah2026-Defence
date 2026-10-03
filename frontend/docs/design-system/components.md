# PLAN:0 Design System — Component Catalog

This is the source of truth for shared UI primitives currently shipped in
`frontend/components/`. Product screens should compose these components before
introducing a new shared primitive. Update this catalog whenever a shared
primitive is added, removed, renamed, or materially re-scoped.

Use the semantic tokens and accessibility contract in the adjacent foundation
documents for every entry below. The live visual reference is `/design-system`.

## Actions and overlays

| Component | Source | Use and accessibility contract |
| --- | --- | --- |
| `Button`, `IconButton` | `ui/Button.tsx` | Standard actions. `IconButton` requires its text `label` prop to provide an accessible name. |
| `Dialog` | `ui/Dialog.tsx` | Controlled modal for blocking decisions; provides labelled native-dialog semantics and restores focus on close. |
| `PageNavigationBar` | `ui/PageNavigationBar.tsx` | Compact page heading with an optional callback or link-based back action and trailing icon action. |

## Forms

| Component | Source | Use and accessibility contract |
| --- | --- | --- |
| `TextField`, `SearchField`, `SelectField`, `DateField` | `ui/FormControls.tsx` | Labelled native controls with optional helper and error text. |
| `RadioGroup`, `CheckboxGroup`, `SegmentedControl` | `ui/FormControls.tsx` | Native grouped choices with a fieldset and legend. |
| `Slider`, `Stepper` | `ui/FormControls.tsx` | Numeric input controls; retain labelled values, limits, and keyboard operation. |

## Status and data

| Component | Source | Use and accessibility contract |
| --- | --- | --- |
| `Alert`, `Banner` | `ui/Alert.tsx` | Persistent feedback with icon, text, and appropriate live announcement. |
| `Toast`, `ToastViewport` | `ui/Toast.tsx` | Brief non-blocking status; feature code owns dismissal and duration. |
| `Tag`, `Badge` | `ui/Tag.tsx` | Compact categorization; never use color as the only meaning. |
| `LinearProgress`, `CircularProgress` | `ui/Progress.tsx` | Progress with a text value and semantic status. |
| `DataTable` | `ui/DataTable.tsx` | Searchable, sortable tabular data using native table semantics. |
| `Map` | `ui/Map.tsx` | Map plus keyboard-accessible location list and selected-location detail; always provide the list alternative. |

## PLAN:0 composition

| Component | Source | Use |
| --- | --- | --- |
| `ReadinessCard` | `ui/Cards.tsx` | Household preparedness progress and a next action; supports optional next-step context and a primary action treatment. |
| `FamilyMembersCard`, `FamilyProfileCard` | `ui/Cards.tsx` | Household members and their key profile information. |
| `ShelterCard` | `ui/Cards.tsx` | Nearby shelter or critical location summary; do not imply availability without sourced current data. |
| `HouseholdResourcesCard` | `ui/Cards.tsx` | Household resources and related management action. |
| `AppNavigation` | `ui/AppNavigation.tsx` | Responsive primary navigation with current-page state. |

## Accessibility infrastructure

| Component | Source | Use and contract |
| --- | --- | --- |
| `AccessibilityProvider`, `useAccessibilityPreferences` | `accessibility/AccessibilityProvider.tsx` | Root preference owner for appearance, text scale, and link underlining; components must not read or write preference storage independently. |
| `AccessibilityIcon` | `accessibility/AccessibilityIcon.tsx` | Shared universal-access symbol. It is decorative when paired with a visible Accessibility label. |
| `AccessibilityMenu` | `accessibility/AccessibilityMenu.tsx` | Global preference launcher and panel. Keep its keyboard, focus, theme, text-scale, read-aloud, and reset behavior intact. |
| `AccessibilityPreferencesControls` | `accessibility/AccessibilityPreferencesControls.tsx` | Shared preference controls for the compact launcher and sectioned settings page; always use the root accessibility provider for state and persistence. |
