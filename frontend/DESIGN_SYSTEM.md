# Design System

This document describes the shared design tokens and conventions for SimpleChef frontend, aligned with HCI principles (visibility, consistency, affordances, reduced cognitive load).

## Spacing scale

Use the spacing scale from `theme/spacing.ts` instead of arbitrary pixel values:

| Token | Value | Typical use |
|-------|-------|-------------|
| `xs`  | 4     | Minimal gaps, dense lists |
| `sm`  | 8     | Inline gaps, chip spacing |
| `md`  | 12    | Form field margins, section padding |
| `lg`  | 16    | Content padding, row gaps |
| `xl`  | 24    | Section spacing, modal padding |
| `xxl` | 32    | Large separators, touch targets |

Import: `import { spacing } from '../theme/spacing';`

## Color roles

Use theme colors for backgrounds and text. Avoid hardcoded hex values and opacity hacks for "muted" text.

| Role | Purpose |
|------|---------|
| `surface` | Main content background |
| `background` | Screen/page background |
| `onSurface` | Primary text on surface |
| `onSurfaceVariant` | Secondary/muted text (use instead of opacity) |
| `surfaceVariant` | Chips, section headers, subtle emphasis |
| `outline` | Borders, dividers |

Access via `useTheme()`: `theme.colors.surface`, `theme.colors.onSurfaceVariant`, etc.

## Contrast targets (WCAG AA)

- Body text: at least **4.5:1** contrast against background
- Large text (18pt+ or 14pt+ bold): at least **3:1** contrast
- Avoid using `opacity` to mute text; use `onSurfaceVariant` or `outline` for semantic secondary text

## Guidance for new screens

1. Use `useTheme()` and `theme.colors.*` for backgrounds and text
2. Import and use `spacing` instead of raw pixel values
3. Avoid hardcoded colors (hex) and opacity for muted text
4. Buttons: maintain `minHeight: 48` (or equivalent) for touch targets
