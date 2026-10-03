# Accessibility system

## Purpose

PLAN:0 will target **WCAG 2.2 AA** across the whole product. This includes every
page, component, and user journey; it is not achieved by adding an accessibility
toolbar alone. The floating control gives people extra presentation
preferences, while accessible semantics, keyboard operation, focus behavior,
and content remain the default for everyone.

This document is an architecture and adoption guide for the accessibility
foundation already implemented in the application: root-level preference
management and persistence, semantic theme tokens, and the floating
accessibility control. It gives the forthcoming design system one stable
accessibility contract to adopt as product components are built.

The canonical color palette, semantic role definitions, accessible pairings,
and theme maps live in [Plan: 0 Design System — Color Foundations](design-system/colors.md).
This guide defines the accessibility behavior that every use of those color
tokens must preserve.

## Guiding principles

- Use native HTML before ARIA. A real `button`, `input`, `label`, heading, link,
  and landmark already expose the correct behavior to keyboards and assistive
  technology.
- Build inclusive defaults. Every feature must be usable without discovering or
  opening the floating control.
- Use semantic design tokens rather than component-specific colors, font sizes,
  or focus styles. A theme is a token mapping, not a collection of overrides.
- Preserve user choice. Respect browser zoom and operating-system accessibility
  preferences even when a PLAN:0 preference has been selected.
- Test behavior, not only markup. Automated checks find regressions; keyboard,
  zoom, and screen-reader checks verify the actual experience.

## Preference contract

The future implementation should own preferences at the application root. A
small client-side provider is responsible for reading, validating, applying,
and persisting the state. Pages and design-system components must not access
storage or implement theme rules independently.

```ts
type AppearancePreference =
  | "system"
  | "light"
  | "dark"
  | "hc-black-white"
  | "hc-black-yellow";

type TextScale = 25 | 50 | 75 | 100 | 112.5 | 125 | 150 | 175 | 200;

type AccessibilityPreferences = {
  appearance: AppearancePreference;
  textScale: TextScale;
  underlineLinks: boolean;
};
```

On a first visit, appearance resolves from `prefers-color-scheme` and text
scale is `100`. Preferences persist locally in the browser once the visitor
changes them. Account synchronization is deliberately out of scope until
PLAN:0 has user profiles; when it is added, it should synchronize this same
contract rather than introduce a second representation.

The root document is the single application point for preferences. The provider
should expose the resolved appearance and scale to the DOM through stable data
attributes (for example, `data-theme` and `data-text-scale`). It should apply
stored values before the UI is visibly painted to prevent a flash of the wrong
theme. All persistence, validation of unknown stored values, OS-preference
resolution, and future migration logic live there.

## Tokens and theming

The design system should define semantic tokens at the root, then map those
tokens for each appearance. Components consume only semantic tokens, never a
palette value such as a particular gray or yellow.

Minimum token families:

- Surfaces: page, raised, sunken, overlay, and disabled.
- Content: primary, secondary, muted, inverse, link, and placeholder text.
- Interaction: default, hover, active, selected, disabled, and focus-ring.
- Feedback: success, warning, danger, and informational foreground/background.
- Structure: border, separator, shadow, radius, spacing, typography, and
  motion duration.

The normal light and dark palettes must satisfy WCAG contrast requirements,
including 4.5:1 for normal text and 3:1 for non-text UI indicators. The two
high-contrast palettes are explicit, complete token maps:

- `hc-black-white`: black surfaces with white content and clear white focus
  indicators.
- `hc-black-yellow`: black surfaces with yellow content, controls, and focus
  indicators chosen for sufficient contrast.
- `grayscale`: a full neutral token map that preserves contrast; it is not a
  blanket CSS filter that could make media illegible.

Do not use color as the only way to communicate status or selection. Supply a
text label, icon with an accessible name, pattern, or other non-color cue as
appropriate. In `forced-colors: active`, defer to system colors instead of
trying to preserve the custom high-contrast palettes. Respect
`prefers-reduced-motion` by removing or reducing non-essential animation;
never make motion necessary to understand or operate a feature.

## Typography and reflow

Text scale is a multiplier for the typography token system, not an ad-hoc
override on individual elements. Text and related spacing should use `rem` and
unitless line heights, with a root scale variable derived from `TextScale`.

The increase and decrease controls step through the declared scale values and
disable at `200` and `25` respectively. A reset returns to `100`. Browser
zoom remains independent and must continue to work; the in-product scale does
not replace the WCAG requirement to resize text and reflow content.

All future layouts must support enlarged text and 400% browser zoom without
loss of information, controls, or primary actions. Avoid essential fixed
heights, viewport-locked text containers, and horizontal scrolling for normal
one-dimensional content. Preserve at least 24 by 24 CSS pixels of pointer
target area at AA minimum; use 44 by 44 CSS pixels as the design-system default
for primary touch controls.

## Floating accessibility control

The future control is a fixed, top-right launcher, positioned with safe-area
insets and enough viewport offset that it neither covers browser UI nor an
active control. It must remain reachable at narrow widths, enlarged text, and
zoom. If the preferred placement would obscure content, it may reposition, but
the keyboard and semantic behavior must not change.

### Contents

The panel contains:

1. An appearance radio group: **Use device setting**, **Light**, **Dark**,
   **High contrast — black / white**, **High contrast — black / yellow**, and
   **Grayscale**.
2. A text-size group with **Decrease text size**, a live current-value label,
   **Increase text size**, and **Reset text size**.
3. A native switch for **Underline links**, which lets people opt in to
   underlining every link through the semantic link token rather than adding
   ad-hoc treatment to individual links. It is off by default in every
   appearance mode.
4. **Read aloud** controls that use the browser's speech-synthesis API to read
   the route's `main` content, with play/pause/resume, stop, and a live status.
   Playback is transient and does not replace screen-reader support.
5. **Reset settings**, which restores device-controlled appearance, 100% text,
   and the default link treatment.

The requested light, dark, black/white, and black/yellow options are always
available. “Use device setting” is the recoverable default and resolves to the
visitor’s operating-system color preference.

### Semantics, focus, and keyboard behavior

Use a named native `button` for the launcher with `aria-expanded` and
`aria-controls`. The expanded panel is a labelled, non-modal dialog/popover;
it is not an ARIA `menu`, because it contains persistent form controls rather
than a list of commands.

- Opening the panel moves focus to its heading or selected appearance option.
- Closing with Escape or the launcher returns focus to the launcher. An outside
  pointer interaction closes the panel and lets its target receive focus
  naturally; it must not unexpectedly reset focus to the launcher.
- Tab and Shift+Tab follow the natural control order. Focus must remain visible
  at every step and must never be fully covered by the fixed control or a
  sticky element.
- Enter and Space activate buttons. Arrow keys select choices in the native
  appearance radio group. No action depends on hover, drag, or a pointer.
- Text-size buttons use native disabled state at their limits. A polite live
  region announces the resulting size (for example, “Text size: 125%”).
- Every icon has an accessible name; visible text and accessible labels remain
  synchronized. State is conveyed programmatically as well as visually.

Do not trap focus in this non-modal panel. A visitor may tab onward after its
last control; the panel closes only through its explicit dismissal behavior.

## Product-wide accessibility baseline

Every design-system component and feature must meet these requirements before
the floating control is considered:

- Landmarks, logical heading hierarchy, descriptive page titles, and one clear
  primary heading per route. Next.js route announcements rely on useful titles
  and headings during client-side navigation.
- Full keyboard access, predictable focus order, visible focus indicators, and
  no keyboard trap. Dialogs, popovers, menus, and other composites follow their
  appropriate interaction pattern.
- Labels and instructions for inputs; errors that identify the field, explain
  the problem, and are announced without relying only on color.
- Alternative text for meaningful images, empty alt text for decorative images,
  captions/transcripts where applicable, and no information conveyed by shape,
  color, or sound alone.
- Contrast, text resizing, reflow, target size, orientation, and reduced-motion
  behavior verified for the supported responsive layouts.

## Delivery and validation

When implementation begins, add the provider, token maps, and control as a
small vertical slice before converting individual product components. Migrate
components progressively to semantic tokens; do not retain raw color escape
hatches except for documented brand assets that are not interactive UI.

Keep Next.js' built-in accessibility linting enabled. Add automated axe checks
and browser-level keyboard tests for the control and for representative forms,
navigation, dialogs, and error states. Validate manually in current Chrome,
Firefox, and Safari, including NVDA on Windows and VoiceOver on macOS/iOS.

The minimum release checklist for this system is:

- Each theme passes documented contrast checks for text, controls, focus, and
  status states.
- Appearance, text scale, reset, persistence, and OS-setting resolution work
  across reloads without a visible theme flash.
- The panel is entirely operable with keyboard alone, has correct screen-reader
  names and state announcements, and restores focus correctly after dismissal.
- Content remains usable at 200% in-product text scale and at 400% browser
  zoom, without essential horizontal scrolling or clipped controls.
- Reduced-motion and forced-color modes remain usable and take precedence where
  the platform requires them.

## References

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Next.js accessibility guidance](https://nextjs.org/docs/architecture/accessibility)
