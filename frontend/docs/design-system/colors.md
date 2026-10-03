# Plan: 0 Design System — Color Foundations

## Purpose and scope

This is the canonical color contract for Plan: 0. It establishes the palette,
semantic roles, theme mappings, and accessibility rules that future UI
components must use. Buttons, fields, typography, spacing, elevation, motion,
and component anatomy are intentionally specified in later design-system
chapters.

Color is a supporting signal, never the only way to convey meaning, error,
selection, or state. Components must also provide a text label, icon with an
accessible name, shape, pattern, or programmatic state as appropriate.

The target for normal light and dark themes is **WCAG 2.2 AA**:

- Normal text and its background require at least 4.5:1 contrast.
- Large text and non-text UI indicators, including a visible focus indicator,
  require at least 3:1 contrast against adjacent colors.
- Disabled controls may have reduced contrast only when they are genuinely
  unavailable and do not contain essential information.

## Token architecture

Colors have two layers. Primitive values are implementation inputs and are not
consumed by components. Semantic tokens are the stable public contract.

```text
Primitive palette → semantic role → component property
red-500          → action-primary → Button background
neutral-950      → content-primary → Body text
```

Future CSS exposes semantic custom properties only. Components must use these
families and must not add a raw hex value or a primitive token:

```text
--surface-*
--content-*
--border-*
--action-*
--feedback-*
--focus-ring
```

The existing appearance attributes are part of the contract and remain
unchanged: `light`, `dark`, `grayscale`, `hc-black-white`, and
`hc-black-yellow`. A device-controlled preference resolves to `light` or
`dark`; `forced-colors: active` defers to platform system colors.

## Primitive palette

### Supplied light foundations

| Primitive | Value | Intended source role |
| --- | --- | --- |
| `neutral-950` | `#0A0A0A` | Primary ink and dark inverse surface |
| `neutral-900` | `#1F1F1F` | Secondary ink |
| `neutral-500` | `#6B7280` | Strong borders and disabled/de-emphasized UI |
| `neutral-200` | `#E5E7EB` | Subtle light surface |
| `neutral-100` | `#F3F4F6` | Light canvas |
| `neutral-0` | `#FFFFFF` | Raised light surface and inverse ink |
| `red-500` | `#FF0033` | Plan: 0 brand/action base |

### Accessibility-derived primitives

| Primitive | Value | Reason |
| --- | --- | --- |
| `neutral-550` | `#626974` | Accessible muted text on the light canvas |
| `red-600` | `#D4002A` | Accessible red text, link, and light-theme danger foreground |
| `red-400` | `#FF4D6D` | Accessible accent/link foreground on dark surfaces |
| `green-700` | `#087A3A` | Light-theme success foreground |
| `amber-800` | `#8A3D00` | Light-theme warning foreground |
| `blue-700` | `#0057B8` | Light-theme information foreground |
| `green-300` | `#70E69A` | Dark-theme success foreground |
| `amber-300` | `#FFC36A` | Dark-theme warning foreground |
| `red-300` | `#FF8AA0` | Dark-theme danger foreground |
| `blue-300` | `#9DCAFF` | Dark-theme information foreground |

`neutral-500` is 4.39:1 on `neutral-100`, so it must not be used as normal
text on the light canvas. `red-500` is 3.60:1 on `neutral-100` and 3.96:1
against white, so it must not be used as normal red text on light surfaces or
with white normal-size text.

## Semantic color roles

### Light theme

| Semantic token | Value | Approved use |
| --- | --- | --- |
| `--surface-canvas` | `#F3F4F6` | Application page background |
| `--surface-raised` | `#FFFFFF` | Cards, panels, fields, menus |
| `--surface-subtle` | `#E5E7EB` | Recessed/decorative surfaces only |
| `--surface-inverse` | `#0A0A0A` | Inverse sections and overlays |
| `--content-primary` | `#0A0A0A` | Headings, body copy, essential icons |
| `--content-secondary` | `#1F1F1F` | Supporting copy |
| `--content-muted` | `#626974` | Metadata and non-essential supporting copy |
| `--content-inverse` | `#FFFFFF` | Text on inverse surfaces |
| `--content-link` | `#D4002A` | Inline links; always paired with an underline |
| `--content-disabled` | `#6B7280` | Unavailable controls only |
| `--border-strong` | `#6B7280` | Inputs, controls, selected boundaries |
| `--border-subtle` | `#E5E7EB` | Decorative separators only |
| `--action-primary` | `#FF0033` | Primary action fill with `#0A0A0A` foreground |
| `--action-primary-hover` | `#FF4D6D` | Hovered primary action with `#0A0A0A` foreground |
| `--action-primary-pressed` | `#D4002A` | Pressed primary action with `#FFFFFF` foreground |
| `--action-selected` | `#D4002A` | Persistent selected state with `#FFFFFF` foreground |
| `--action-danger` | `#D4002A` | Destructive action boundary and pressed fill with `#FFFFFF` foreground |
| `--action-danger-hover` | `#FFE6EB` | Hovered destructive action with `#D4002A` foreground |
| `--focus-ring` | `#0A0A0A` | 3px visible focus outline |

### Dark theme

| Semantic token | Value | Approved use |
| --- | --- | --- |
| `--surface-canvas` | `#0A0A0A` | Application page background |
| `--surface-raised` | `#141414` | Cards, panels, fields, menus |
| `--surface-subtle` | `#1F1F1F` | Recessed/decorative surfaces |
| `--surface-inverse` | `#FFFFFF` | Inverse sections and overlays |
| `--content-primary` | `#FFFFFF` | Headings, body copy, essential icons |
| `--content-secondary` | `#E5E7EB` | Supporting copy |
| `--content-muted` | `#9CA3AF` | Metadata and non-essential supporting copy |
| `--content-inverse` | `#0A0A0A` | Text on inverse surfaces |
| `--content-link` | `#FF4D6D` | Inline links; always paired with an underline |
| `--content-disabled` | `#9CA3AF` | Unavailable controls only |
| `--border-strong` | `#9CA3AF` | Inputs, controls, selected boundaries |
| `--border-subtle` | `#3A3A3A` | Decorative separators only |
| `--action-primary` | `#FF0033` | Primary action fill with `#0A0A0A` foreground |
| `--action-primary-hover` | `#FF4D6D` | Hovered primary action with `#0A0A0A` foreground |
| `--action-primary-pressed` | `#FF8099` | Pressed primary action with `#0A0A0A` foreground |
| `--action-selected` | `#FF8099` | Persistent selected state with `#0A0A0A` foreground |
| `--action-danger` | `#FF8AA0` | Destructive action boundary and pressed fill with `#0A0A0A` foreground |
| `--action-danger-hover` | `#460014` | Hovered destructive action with `#FF8AA0` foreground |
| `--focus-ring` | `#FFFFFF` | 3px visible focus outline |

An action's foreground must change with its state where specified above. Do not
reuse white text with `--action-primary` in the light theme.

### Feedback roles

Feedback roles describe status treatment. Destructive actions use the separate
`--action-danger-*` tokens and must still have clear, explicit wording.

| Role | Light foreground / background | Dark foreground / background |
| --- | --- | --- |
| Success | `#087A3A` / `#E6F7EC` | `#70E69A` / `#123A22` |
| Warning | `#8A3D00` / `#FFF4E5` | `#FFC36A` / `#3F2600` |
| Danger | `#D4002A` / `#FFE6EB` | `#FF8AA0` / `#460014` |
| Information | `#0057B8` / `#E8F1FF` | `#9DCAFF` / `#00274E` |

The public tokens are `--feedback-success-*`, `--feedback-warning-*`,
`--feedback-danger-*`, and `--feedback-info-*`, each with `foreground` and
`background` suffixes. Errors use the danger role; brand red is not a separate
error-only color.

## Accessibility themes

### Grayscale

Grayscale is an explicit neutral theme, not a CSS filter. Its semantic map is:

| Role | Value |
| --- | --- |
| Canvas / raised / subtle | `#F1F1F1` / `#FFFFFF` / `#DEDEDE` |
| Primary / secondary / muted content | `#111111` / `#414141` / `#575757` |
| Link / action / focus | `#111111` / `#111111` / `#111111` |
| Action / selected foreground | `#FFFFFF` |
| Strong border | `#575757` |

Links remain underlined. All feedback tokens resolve to neutral foreground and
background values, so feedback components must preserve their icon and text.

### High contrast

`hc-black-white` resolves surfaces to black and all essential content,
boundaries, actions, and focus to white, with black action and selected-state
foregrounds. `hc-black-yellow` follows the same map using yellow (`#FFFF00`)
for essential content, boundaries, actions, focus, and selected surfaces, with
black action and selected-state foregrounds.

For both themes, feedback semantic tokens alias the active high-contrast
foreground/background roles. They do not introduce category colors. In
`forced-colors: active`, custom palette values yield to system colors such as
`Canvas`, `CanvasText`, `LinkText`, and `Highlight`.

## Approved pairings and interaction rules

| Pairing | Contrast | Rule |
| --- | --- | --- |
| `#0A0A0A` on `#F3F4F6` | 17.99:1 | Primary light text |
| `#1F1F1F` on `#F3F4F6` | 14.98:1 | Secondary light text |
| `#626974` on `#F3F4F6` | 5.03:1 | Muted light text |
| `#D4002A` on `#FFFFFF` | 5.48:1 | Light links and danger text |
| `#0A0A0A` on `#FF0033` | 5.00:1 | Default primary action label |
| `#FFFFFF` on `#D4002A` | 5.48:1 | Pressed light primary action label |
| `#FFFFFF` on `#141414` | 18.42:1 | Primary dark text |
| `#FF4D6D` on `#0A0A0A` | 6.16:1 | Dark links and accent text |

- Use the focus token as a 3px outline with at least a 3px offset. It must not
  be removed, hidden by an overlay, or conveyed only by a color-fill change.
- Inline links are underlined at rest, with a thickness of at least 2px or
  `0.08em` and an offset of at least `0.16em`. Hover and focus may add a
  second cue but may not remove the underline.
- `--border-subtle` is decorative. A control boundary required for operation or
  identification uses `--border-strong` or another documented 3:1 treatment.
- Red, green, amber, blue, and grayscale feedback treatments always preserve
  identical semantic labels, icons, and programmatic status.

## Adoption rules

1. New UI uses semantic tokens only; raw hex values are limited to this token
   layer and documented brand assets.
2. A theme remaps semantic tokens, not component selectors. A component must
   look correct across all supported themes without its own theme override.
3. The design-system default is this color contract. A product exception needs
   a documented pairing, contrast result, semantic owner, and reason.
4. Existing application styles are not migrated by this documentation
   milestone. The later token-migration milestone will align `app/globals.css`
   and components with this contract.

## Verification checklist

- Check every documented text and status foreground/background pair at 4.5:1
  or higher, and control borders plus focus indicators at 3:1 or higher.
- Verify all states in light, dark, grayscale, and both high-contrast themes.
- Inspect keyboard focus on light surfaces, dark surfaces, and filled primary
  actions; focus must remain visible at 200% in-product text scale and 400%
  browser zoom.
- Confirm inline links remain distinguishable when hue is unavailable and that
  feedback still communicates its meaning without color.
