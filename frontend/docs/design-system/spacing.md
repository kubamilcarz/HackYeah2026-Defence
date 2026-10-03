# Plan: 0 Design System — Spacing

## Purpose and scope

Spacing gives Plan: 0 a consistent rhythm across layouts and components. It is a
4px-based scale used for padding, gaps, margins, component dimensions, and
layout separation. New UI uses these tokens instead of raw pixel values or
one-off Tailwind spacing utilities.

Spacing is deliberately appearance-independent: light, dark, grayscale, and
high-contrast themes share the same values. The web tokens use `rem`, so they
scale with the product text-size preference and preserve comfortable reflow at
larger text sizes.

## Scale

| Token | Default value | Typical use |
| --- | --- | --- |
| `--space-1` | 4px / `0.25rem` | Tight icon or inline adjustment |
| `--space-2` | 8px / `0.5rem` | Icon-to-label gap and compact stacks |
| `--space-3` | 12px / `0.75rem` | Compact control padding and grouped items |
| `--space-4` | 16px / `1rem` | Standard component padding |
| `--space-5` | 20px / `1.25rem` | Comfortable horizontal control padding |
| `--space-6` | 24px / `1.5rem` | Card padding and related-content separation |
| `--space-8` | 32px / `2rem` | Section-internal separation |
| `--space-10` | 40px / `2.5rem` | Major component separation |
| `--space-12` | 48px / `3rem` | Standard action target size |
| `--space-16` | 64px / `4rem` | Page-level section separation |

Choose the smallest token that gives content adequate room. Do not introduce
intermediate values to fine-tune visual alignment; adjust the component layout
or use the nearest scale value instead.

## Web implementation contract

The tokens live in `app/globals.css` and are consumed directly with CSS custom
properties. Shared primitives must use them for their internal spacing and
dimensions:

```css
.button {
  gap: var(--space-2);
  min-height: var(--space-12);
  padding: var(--space-3) var(--space-5);
}
```

Use tokens in CSS, inline styles, or Tailwind arbitrary values when necessary:

```tsx
<div className="gap-[var(--space-6)] p-[var(--space-4)]" />
```

The action target token is a minimum, not a fixed height for every control.
Content may increase a control’s height at larger text scales; do not clip or
truncate its label to preserve 48px.

## Accessibility and adoption

- Keep at least `--space-12` (48px) for primary touch actions and icon-only
  controls. This exceeds the 24px WCAG AA target-size minimum.
- Use `gap` for separation within a flex or grid layout. Reserve margins for
  separation between independent blocks, avoiding stacked margins that make
  vertical rhythm hard to reason about.
- Spacing must reflow at 200% product text scale and 400% browser zoom without
  horizontal scrolling, clipped controls, or overlapping fixed UI.
- Existing screens are migrated progressively. The shared `Button` and
  `IconButton` primitives are the first consumers of this token contract.

## Live reference

`/design-system#foundations` renders every approved spacing token at its
default value. Treat it as the visual reference when changing this scale.
