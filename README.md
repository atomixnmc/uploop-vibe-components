<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/atomixnmc/uploop-vibe-components/main/docs/vibe-logo.svg">
    <img alt="Uploop Vibe" src="https://raw.githubusercontent.com/atomixnmc/uploop-vibe-components/main/docs/vibe-logo.svg" width="420">
  </picture>
</p>

<p align="center">
  <strong>AI-first design components and design framework for Uploop HyperGraph.</strong>
</p>

<p align="center">
  <a href="https://github.com/atomixnmc/uploop-vibe-components/actions/workflows/ci.yml"><img src="https://github.com/atomixnmc/uploop-vibe-components/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/atomixnmc/uploop-vibe-components/actions/workflows/release.yml"><img src="https://github.com/atomixnmc/uploop-vibe-components/actions/workflows/release.yml/badge.svg" alt="Release"></a>
  <a href="#"><img src="https://img.shields.io/badge/components-98-blueviolet" alt="Components"></a>
  <a href="#"><img src="https://img.shields.io/badge/version-v0.1.0-orange" alt="Version"></a>
  <a href="https://github.com/atomixnmc/uploopjs"><img src="https://img.shields.io/badge/powered%20by-UploopJS-646cff" alt="UploopJS"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-purple" alt="License"></a>
</p>

---

**Uploop Vibe** is not another component library. It's an **AI-native design framework** where components are inspectable HyperGraph nodes, AI generates UIs from intent descriptions, and every page exports a machine-readable manifest.

Built on [UploopJS](https://github.com/atomixnmc/uploopjs) — the HyperGraph UI framework where components are typed graphs of nodes and edges.

```js
import { Button, Card, vibeLight, applyVibeTheme } from '@uploop-vibe/vibe'
import { generateComponent, composeEntityPage } from '@uploop-vibe/vibe-ai'

// 1. Apply theme
applyVibeTheme(vibeLight)

// 2. Generate from intent (AI-driven)
const btn = generateComponent({ type: 'button', props: { label: 'Save', variant: 'solid' } })
btn.mount(document.getElementById('root'))

// 3. Compose from schema
const page = composeEntityPage({ schema: userSchema, mode: 'form' })
page.page.mount(document.getElementById('app'))
```

## Why Vibe?

| | Traditional UI Lib | Uploop Vibe |
|---|-------------------|-------------|
| **Creation** | Manual code | **Intent-driven** — describe, don't code |
| **AI Integration** | None | **Native intent API** — LLMs generate JSON, not JSX |
| **Inspectability** | DOM tree + CSS classes | **HyperGraph manifest** — typed nodes, edges, state shape |
| **Optimization** | Manual profiling | **24 pre-tuned execution profiles** — auto-suggested |
| **Bundle (gzip)** | 50-75 KB | **~46 KB** (uploopjs + vibe) |
| **CSP-safe** | No (inline handlers) | **Yes** — `addEventListener`, no `eval` |
| **Architecture** | Component tree | **HyperGraph** — inspectable, serializable, debuggable |

## Packages

| Package | Description |
|---------|-------------|
| `@uploop-vibe/vibe` | 98 components, design tokens, theme engine, motion system, layout builder |
| `@uploop-vibe/vibe-ai` | Intent → Component resolver, Schema → Page composer, template materializer |

## 98 Components · 10 Categories

| Category | Components |
|----------|-----------|
| **Layout** (12) | Container, Grid, Stack, Flex, Spacer, Divider, Box, Center, AspectRatio, Wrap, SkipNav, BackToTop |
| **Navigation** (10) | Nav, Dropdown, Tabs, Breadcrumb, Link, Pagination, Stepper, ContextMenu, CommandPalette, ScrollSpy |
| **Data Entry** (16) | Input, Textarea, Select, Checkbox, Radio, Switch, Slider, NumberInput, SearchInput, PinInput, ColorPicker, FileUpload, TagInput, Rating, Combobox, SegmentedControl |
| **Data Display** (14) | Card, CardHeader, CardBody, CardFooter, Badge, Avatar, Table, List, Timeline, TreeView, Stat, DescriptionList, Accordion, Carousel |
| **Feedback** (12) | Toast, Skeleton, Progress, Alert, Notification, Banner, Spinner, EmptyState, ErrorState, LoadingOverlay, Result, Spotlight |
| **Overlay** (9) | Modal, Dialog, Tooltip, Drawer, Sheet, Popover, HoverCard, Lightbox, FullscreenOverlay |
| **Typography** (9) | Heading, Text, Label, Caption, Highlight, Code, BlockCode, Kbd, Blockquote |
| **Media** (6) | Icon, Image, Video, Audio, Figure, AvatarGroup |
| **Utility** (5) | Portal, Transition, FocusTrap, ClickOutside, LazyLoad |
| **DataViz** (4) | Sparkline, Gauge, StatsCard, TrendIndicator |
| **Button** (1) | Button — 8 variants × 5 sizes × icon × loading × animation |

## AI-First: Intent → UI

The breakthrough: describe what you want, Vibe materializes it.

```js
import { generateComponent, composeEntityPage, materializeTemplate } from '@uploop-vibe/vibe-ai'

// Intent → Component
const btn = generateComponent({
  type: 'button',
  props: { label: 'Save', variant: 'solid', size: 'lg' },
  style: { animate: 'scale-in' }
})

// Schema → Full Page
const { page, entityComp, flow } = composeEntityPage({
  schema: userSchema,
  mode: 'form'
})

// Template → Page
const signup = materializeTemplate('signupForm')
```

**No code generation.** Vibe maps intents to existing, tested HyperGraph components — then wires them into a running Uploop loop. LLMs generate JSON, not JSX.

## Quick Start

```bash
git clone https://github.com/atomixnmc/uploop-vibe-components.git
cd uploop-vibe-components
pnpm install
pnpm dev          # → http://localhost:3100
```

Open the browser to see:
- **Component Showcase** (`/showcase/`) — 98 components with live demos and code
- **Vibe AI Examples** (`/vibe-ai/`) — Intent → Component, Schema → Page, Templates

## Design System

- **60+ design tokens** — colors, spacing, typography, shadows, radius, z-index, motion
- **Theme engine** — `vibeTheme()`, `vibeLight`, `vibeDark`, CSS custom properties
- **11 animation presets** — fade, slide, scale, spin, pulse, shimmer + stagger
- **Intent-mapped scales** — `resolveSize('md')`, `resolveVariant('ghost')`

## Powered by UploopJS

Vibe is built on [UploopJS](https://github.com/atomixnmc/uploopjs) — the HyperGraph UI framework with:

- **Graph engine** — typed nodes, dependency edges, topological sort, critical path analysis
- **Declarative async** — `debounce`, `cache`, `interruptible`, `error` as metadata on handlers
- **CSP-safe** — `@click` uses `addEventListener`, no inline `onclick`
- **No build step** — pure ESM, works from CDN or local file
- **No JSX** — standard tagged template literals
- **~26 KB gzip** — 40% smaller than React + Tailwind + Zustand + Router combined

## Docs

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Full architecture — packages, data flow, dependency map |
| [HOWTO.md](./docs/HOWTO.md) | Developer guide — components, AI intent API, theming |
| [AI_GUIDELINE.md](./docs/AI_GUIDELINE.md) | Project rules — SDLC, commits, code style |
| [PLAN.md](./docs/PLAN.md) | Development phases v0.1–v0.9 |
| [reports/why-vibe-wins-ai-moat.md](./docs/reports/why-vibe-wins-ai-moat.md) | Why AI-first beats 10 years of components |
| [reports/v0.1-compare-frameworks.md](./docs/reports/v0.1-compare-frameworks.md) | Framework comparison: MUI, Ant, Chakra, Ark, Daisy |

## License

MIT
