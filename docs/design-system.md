# Design System Rules

## 1) Spacing
- Use spacing tokens from `--space-2` to `--space-12` only.
- Base rhythm is 4px; tokens map to rem-based values for responsive scaling.
- Vertical section spacing should prefer `--space-10` and above for major blocks.
- Internal card padding should use `--space-4` to `--space-6`.

## 2) Typography
- Primary font stack: `--font-sans`.
- Heading hierarchy:
  - `h1`: landing hero/main value proposition.
  - `h2`: featured content title level.
  - `h3`: section and card titles.
- Body text uses default line-height (`1.65`) with muted color for supporting descriptions.
- Meta and badge text should remain in the 11px–13px range.

## 3) Color
- Page background: `--bg-default`.
- Elevated/subtle surfaces: `--bg-subtle`.
- Primary text: `--text-primary`.
- Secondary/muted text: `--text-secondary`.
- Accent interactions and highlights: `--accent`.
- Borders and separators:
  - Main line: `--line-default`
  - Muted line: `--line-muted`

## 4) Radius & Elevation
- Small radius: `--radius-sm` for controls.
- Medium radius: `--radius-md` for cards.
- Use `--shadow-card` for default elevated cards and `--shadow-card-hover` for hover state.
- In dark mode, shadows collapse to `none` and hierarchy relies on contrast/borders.

## 5) Component CSS Structure
- Keep `app/globals.css` to reset + token + base primitives only.
- Component-level styles must use CSS Modules colocated with components.
- Page composition/section styles belong to route-level module files (e.g., `app/home.module.css`).
- Naming rule: module-local BEM style (`block__element`, `block__modifier`) for consistency.
