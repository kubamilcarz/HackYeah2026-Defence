# Plan: 0 Design System — Typography

## Purpose and scope

Typography establishes the readable, geometric sans-serif voice of Plan: 0
across the web and mobile apps. **Inter** is the product typeface. Each app
ships the same approved font files; its platform system sans-serif is the
fallback when Inter is unavailable.

The scale below is the platform-neutral source of truth. A role has the same
name, weight, size, and line height on each platform; only the implementation
unit changes. New UI must use the role instead of introducing one-off size,
line-height, or weight combinations.

## Type scale

| Token | Intended use | Family | Weight | Design size / line height | Web adapter |
| --- | --- | --- | --- | --- | --- |
| H1 | Page heading | Inter / geometric sans | Bold (700) | 32 / 40px | `.type-h1` |
| H2 | Section title | Inter / geometric sans | Semibold (600) | 20 / 28px | `.type-h2` |
| H3 | Subheading | Inter / geometric sans | Semibold (600) | 16 / 24px | `.type-h3` |
| Body | Primary reading text | Inter / geometric sans | Regular (400) | 16 / 24px | `.type-body` |
| Caption | Supporting text and metadata | Inter / geometric sans | Regular (400) | 14 / 20px | `.type-caption` |

The design values are logical pixels. At the default scale they map 1:1 to CSS
pixels, iOS points, and Android `sp`. Headings use modest negative tracking
(H1: -0.035em; H2: -0.02em); body and caption retain normal tracking for
readability.

## Platform adapters

| Platform | Unit and font loading | Scaling expectation |
| --- | --- | --- |
| Web | Use the supplied `rem` token values and `.type-*` classes. Inter is self-hosted with `next/font`. | Browser zoom and the product text-size preference scale every role together. |
| iOS | Use Inter with the documented point size and line height. Map each role to the nearest Dynamic Type text style, then scale it with Dynamic Type. | Never cap Dynamic Type or hard-code a text container height. |
| Android | Use Inter with the documented `sp` size and line height in `sp`; map the role to the appropriate Material text semantic. | Respect the user’s `fontScale`; do not substitute `dp` for text size. |

The mobile apps should keep the role name in their token layer (`typography.h1`,
`typography.body`, and so on). They must not copy the web class names or use
CSS `rem` values as native measurements.

## Web implementation contract

Typography primitives live in `app/globals.css`. These are the web adapter of
the cross-platform contract, not the canonical mobile API:

```css
--font-family-sans
--font-weight-regular
--font-weight-semibold
--font-weight-bold
--font-size-h1 through --font-size-caption
--line-height-h1 through --line-height-caption
```

Use the semantic classes for ordinary content:

```tsx
<h1 className="type-h1">Incident overview</h1>
<p className="type-body">Current information and recommended actions.</p>
<p className="type-caption">Last updated 14:32</p>
```

The web adapter uses `rem` values so the existing in-product text-size
preference enlarges every role proportionally. The fixed relationship between
font size and line height remains intact at every supported theme and scale.

## Accessibility rules

- Preserve semantic HTML: use `h1`–`h3` for headings and `p` for text. The
  classes provide presentation only.
- Do not use caption text for essential instructions or error details.
- Do not rely on weight or size alone to communicate status, hierarchy, or an
  interactive state.
- Keep text paired with semantic color tokens defined in
  [the color foundations](./colors.md); typography does not change per theme.
- Web: verify reading order, zoom to 400%, and the text-size preference at
  200%. Content must reflow without clipping or overlap.
- Mobile: verify the largest supported Dynamic Type / system font-scale setting
  without clipping, overlap, or loss of essential actions.

## Live reference

`/design-system#type` renders every approved style using the implementation
tokens. Treat it as the visual regression reference when modifying this scale.
