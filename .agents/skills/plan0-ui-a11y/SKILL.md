---
name: plan0-ui-a11y
description: Build accessible PLAN:0 PWA interfaces with the existing design system. Use when changing frontend UI, shared components, tokens, or accessibility behavior.
---

Use this skill for changes in `frontend/` that affect rendered UI, shared
components, design tokens, responsive behavior, or accessibility.

First inspect the relevant entry in
`frontend/docs/design-system/components.md`. Read the applicable foundation
document in `frontend/docs/design-system/`, or
`frontend/docs/accessibility-system.md`. Reuse an existing primitive when it
meets the need; add a new shared primitive only when composition would be
misleading or would duplicate behavior.

Use semantic design tokens and the existing typography and spacing scale. Do
not introduce raw color values, one-off type scales, component-specific theme
overrides, or CSS filters for accessibility themes. Preserve all supported
appearance modes, text-size preferences, reduced motion, and forced-colors
behavior.

Use native elements before ARIA. Every interaction must have a keyboard path,
visible focus, an accessible name, and a programmatic state where applicable.
Ensure errors, status, selection, and map markers have a non-color cue.
Preserve reflow at 200% product text scale and 400% browser zoom; use 48px as
the default minimum target for primary touch and icon-only controls.

For code changes, run `npm run lint`. When semantic color tokens or mappings
change, also run `npm run verify:colors`. Update the component catalog whenever
a shared primitive is added, removed, renamed, or materially re-scoped.
