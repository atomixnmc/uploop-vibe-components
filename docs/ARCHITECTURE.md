# ARCHITECTURE — Uploop Vibe Components

## Overview

Uploop Vibe is a two-layer design framework built on Uploop's HyperGraph architecture:

```
┌─────────────────────────────────────┐
│         @uploop-vibe/vibe-ai        │  AI Bridge
│  generator · composer · templates   │  Intent → Component
├─────────────────────────────────────┤
│          @uploop-vibe/vibe          │  Design Layer
│  design/ · components/ · layout/   │  Tokens · UI · Pages
├─────────────────────────────────────┤
│    @uploop/html · @uploop/css       │  Uploop Runtime
│    @uploop/core · @uploop/schema    │  HyperGraph Engine
└─────────────────────────────────────┘
```

## Package: `@uploop-vibe/vibe`

The design system and component library. Provides:

### Design System (`design/`)
- **tokens.js** — 60+ atomic design tokens (colors, spacing, type, shadows, radius, z-index, motion duration/easing). Pure data, no DOM.
- **theme.js** — `vibeTheme()`, `vibeLight`, `vibeDark`. Generates CSS custom properties. `applyVibeTheme()` injects vars to `:root`.
- **motion.js** — 11 animation keyframe presets (fade, slide, scale, spin, pulse, shimmer). `injectVibeAnimations()` injects keyframes + utility classes. Stagger support.
- **scales.js** — Intent-mapped scales: `sizeScale` (xs→xl), `variantScale` (solid, outline, ghost, etc.), `radiusScale`, `shadowScale`. `resolveSize()` and `resolveVariant()` map intent strings to CSS values.

### Components (`components/`)
- **button.js** — `Button` with size, variant, icon, loading, disabled, fullWidth, animate
- **card.js** — `Card`, `CardHeader`, `CardBody`, `CardFooter` with slots
- **input.js** — `Input`, `Textarea`, `Select`, `Checkbox` with label, error, hint
- **badge.js** — `Badge` (solid/outline/subtle/dot) + `Avatar` (image/initials/status)
- **toast.js** — `Toast`, `Modal`, `Dialog`, `Tooltip`
- **tabs.js** — `Tabs` (underline/pills/segmented variants)
- **feedback.js** — `Skeleton`, `Progress`, `Icon`
- **data.js** — `Dropdown`, `Nav`, `Table`

All components use `component()` from `@uploop/html` with the `state/update/view` pattern. They output inline styles bound to CSS custom properties (`var(--vibe-color-*)`, `var(--vibe-radius-*)`).

### Layout (`layout/`)
- **grid.js** — `Container`, `Grid` (responsive), `Stack`, `Flex`, `Spacer`, `Divider`
- **page.js** — `createPage()` builds full page layouts from intent: `dashboard`, `form`, `list`, `detail`, `landing`, `settings`, `wizard`

## Package: `@uploop-vibe/vibe-ai`

The AI bridge. Converts high-level intent descriptions into real Uploop components.

### Generator (`generator.js`)
- `resolveComponentIntent(intent)` — maps `{ type: 'button', props: {...} }` to resolved Vibe component + config
- `generateComponent(intent)` — creates a full `component()` from intent
- `describeComponentIntent(intent)` — introspection for AI consumers

### Composer (`composer.js`)
- `composeEntityPage(schema, opts)` — generates a full CRUD page from an `@uploop/schema` entity
- `composeDashboard(opts)` — generates dashboard with widget grid
- `composeListPage(opts)` — generates list page with search + pagination

### Templates (`templates.js`)
- 8 pre-built page templates: `signupForm`, `loginForm`, `settings`, `dashboard`, `dataTable`, `error404`, `emptyState`, `profileCard`
- `materializeTemplate(name, overrides)` — resolves a template to a runnable component

## Data Flow

```
AI Intent                           User Code
    │                                   │
    ▼                                   ▼
resolveComponentIntent()          component('MyBtn', {
    │                               state: { ... },
    ▼                               update: { ... },
generateComponent()                view: (s) => html`...`
    │                             })
    ▼                                   │
component(name, config) ◄───────────────┘
    │
    ▼
@uploop/html component()
    │
    ▼
@uploop/core createLoop()
    │
    ▼
HyperGraph (state → update → view → DOM)
```

## Dependency Map

```
@uploop-vibe/vibe-ai
  ├── @uploop-vibe/vibe          (workspace:*)
  ├── @uploop/core               (link: ../../../uploopjs/packages/core)
  ├── @uploop/html               (link: ../../../uploopjs/packages/html)
  ├── @uploop/css                (link: ../../../uploopjs/packages/css)
  ├── @uploop/schema             (link: ../../../uploopjs/packages/schema)
  └── @uploop/flows              (link: ../../../uploopjs/packages/flows)

@uploop-vibe/vibe
  ├── @uploop/core               (link: ../../../uploopjs/packages/core)
  ├── @uploop/html               (link: ../../../uploopjs/packages/html)
  ├── @uploop/css                (link: ../../../uploopjs/packages/css)
  ├── @uploop/store              (link: ../../../uploopjs/packages/store)
  ├── @uploop/schema             (link: ../../../uploopjs/packages/schema)
  └── @uploop/flows              (link: ../../../uploopjs/packages/flows)
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `link:` protocol to uploopjs | Separate workspaces, no merge conflicts |
| Vite aliases for dev server | Vite doesn't resolve workspace names by default |
| `import` + `export` not re-export | `componentRegistry` needs local bindings |
| Inline styles with CSS vars | No build step, theme-swappable at runtime |
| `component()` from `@uploop/html` | Shares HyperGraph loop, CSP-safe, no JSX |
| Intent → Component mapping | AI can describe UIs, framework resolves to real code |
| `describe()` on intents | AI-readable introspection before generation |
