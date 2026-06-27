# Design: @uploop-vibe/vibe

> **Status:** ✅ v0.1.0 complete
> **Package:** `packages/vibe/`

---

## Overview

The Vibe package is the design system and component library layer. It provides:
- **Design tokens** — pure data, CSS custom property generation
- **Theme engine** — light/dark mode, extensible
- **Motion system** — keyframe animations, utility classes
- **Intent-mapped scales** — map intent strings to CSS values
- **20+ UI components** — built on `@uploop/html` `component()`
- **Layout system** — responsive grid, page builder

## Design Tokens

`design/tokens.js` — 60+ atomic tokens. Pure JavaScript objects, no DOM.

```
colors        → 40+ semantic colors (primary50–900, neutral50–900, semantic, accent)
spacing       → 0–24 rem scale (4px grid)
fontSize      → xs–xl6 (major third: 1.25 ratio)
fontWeight    → thin–extrabold (100–800)
lineHeight    → none–loose
letterSpacing → tighter–widest
radius        → none–full
shadow        → none–xl2 + inner
breakpoints   → z, sm, md, lg, xl–xl5
zIndex        → hide–tooltip (layered scale)
duration      → instant–slower (75ms–500ms)
easing        → linear, in, out, inOut, spring, bounce
```

## Theme Engine

`design/theme.js` — builds `theme()` from `@uploop/css` with vibe-specific CSS custom properties.

```
vibeTheme(config) → { name, mode, colors, spacing, surface, cssVars, vibeVars }
extendVibeTheme(base, overrides) → new theme
applyVibeTheme(theme, root?) → inject CSS vars to DOM
vibeLight / vibeDark → pre-built themes
```

CSS var naming convention: `--vibe-<category>-<key>`
- `--vibe-color-primary600`
- `--vibe-radius-md`
- `--vibe-duration-normal`
- `--vibe-z-modal`

## Motion System

`design/motion.js` — 11 keyframe presets + utility class injection.

```
Keyframes:    vibe-fade-in/out, vibe-slide-in-{up,down,left,right},
              vibe-scale-in/out, vibe-spin, vibe-pulse, vibe-shimmer
Classes:      .vibe-animate-{name}
Modifiers:    .vibe-duration-{faster,fast,normal,slow,slower}
              .vibe-delay-{100,200,300,500}
              .vibe-stagger > * (staggered children)
```

## Intent Scales

`design/scales.js` — maps intent strings to concrete design values.

```
sizeScale:    xs-xl → { h, px, text, icon }
variantScale: solid/outline/ghost/subtle/danger/success/warning/neutral → { bg, fg, border, hover }
radiusScale:  none-xl → CSS var reference
shadowScale:  none-xl2 → CSS var reference
```

Functions: `resolveSize('md')`, `resolveVariant('solid')` return concrete values.

## Components

All components follow the same pattern:

```js
component('VibeButton', {
  state: { /* configurable props */ },
  update: { configure: (s, props) => ({ ...s, ...props }), /* action handlers */ },
  view(state) { return `<element style="..." data-up-*>">...</element>` }
})
```

**Key design decisions:**
- Inline styles bound to CSS custom properties → theme-swappable, no build step
- `configure` handler for intent-driven updates
- `data-up-event`, `data-up-prop`, `data-up-bool` for CSP-safe bindings
- Slots (`data-up-slot`) for child content

## Layout System

`layout/grid.js` — structural layout components:
- `Container` — centered max-width wrapper
- `Grid` — responsive CSS grid (auto-reduces columns at breakpoints)
- `Stack` — vertical/horizontal flex with gap + alignment
- `Flex` — row flex
- `Spacer` — vertical spacing
- `Divider` — horizontal rule with optional label

`layout/page.js` — `createPage()` page builder:
- 7 layout types: `dashboard`, `form`, `list`, `detail`, `landing`, `settings`, `wizard`
- Region-based composition: `header`, `sidebar`, `content`, `toolbar`, `pagination`, `actions`, `steps`, etc.
- Layouts: `sidebar-grid`, `sidebar-right`, `centered`, `full-width`, `stacked`

## Dependencies

```
@uploop/core   → component(), createLoop() (via @uploop/html)
@uploop/html   → component(), html template tag
@uploop/css    → theme(), inject(), injectAnimations()
@uploop/store  → (reserved for future store integration)
@uploop/schema → entityComponent() (for AI composer)
@uploop/flows  → suggestFlow() (for AI suggestions)
```

## File Structure

```
packages/vibe/src/
├── index.js              # Barrel export
├── design/
│   ├── index.js          # Design barrel
│   ├── tokens.js         # 60+ atomic tokens
│   ├── theme.js          # Theme engine
│   ├── motion.js         # Animation presets
│   └── scales.js         # Intent-mapped scales
├── components/
│   ├── index.js          # Component barrel + registry
│   ├── button.js         # Button
│   ├── card.js           # Card + sub-components
│   ├── input.js          # Input, Textarea, Select, Checkbox
│   ├── badge.js          # Badge, Avatar
│   ├── toast.js          # Toast, Modal, Dialog, Tooltip
│   ├── tabs.js           # Tabs
│   ├── feedback.js       # Skeleton, Progress, Icon
│   └── data.js           # Dropdown, Nav, Table
└── layout/
    ├── index.js          # Layout barrel
    ├── grid.js           # Container, Grid, Stack, Flex, Spacer, Divider
    └── page.js           # createPage() page builder
```
