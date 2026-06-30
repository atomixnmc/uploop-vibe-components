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
  <a href="https://github.com/atomixnmc/uploop-vibe-components/actions/workflows/gh-pages.yml"><img src="https://github.com/atomixnmc/uploop-vibe-components/actions/workflows/gh-pages.yml/badge.svg" alt="Pages"></a>
  <a href="#"><img src="https://img.shields.io/badge/components-107-blueviolet" alt="Components"></a>
  <a href="#"><img src="https://img.shields.io/badge/charts-8-success" alt="Charts"></a>
  <a href="#"><img src="https://img.shields.io/badge/version-v0.2.1-orange" alt="Version"></a>
  <a href="https://github.com/atomixnmc/uploopjs"><img src="https://img.shields.io/badge/powered%20by-UploopJS-646cff" alt="UploopJS"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-purple" alt="License"></a>
</p>

---

**Uploop Vibe** is not another component library. It's an **AI-native design framework** built on the HyperGraph architecture. AI generates UIs from intents, Vibe executes via deterministic IFS loops, and every page exports a machine-readable manifest.

Built on [UploopJS](https://github.com/atomixnmc/uploopjs).

```bash
# CLI usage
vibe generate page --goal dashboard --entity Product --actions search,create,delete
vibe generate component --type button --label "Save" --variant solid

# MCP — AI agent integration
vibe mcp    # exposes 9 tools via Model Context Protocol
```

```js
// Programmatic usage
import { generateComponent, runIFSLoop, validateVibeIntent } from '@uploop-vibe/vibe-ai'

const result = await runIFSLoop({
  goal: 'data-management',
  entity: { name: 'User', fields: [...] },
  actions: ['search', 'create', 'edit', 'delete'],
})
// → Converged after 3 iterations. Score: 91 (A).
```

## Packages

| Package | Description |
|---------|-------------|
| `@uploop-vibe/vibe` | 107 components, design tokens, theme engine, motion system, layout builder |
| `@uploop-vibe/vibe-ai` | Intent resolver, IFS loop engine, validator, auditor, error system, spec generator |
| `@uploop-vibe/vibe-charts` | 8 SVG chart types — line, bar, pie, area, scatter, network, heatmap, horizontal bar |
| `@uploop-vibe/vibe-cli` | CLI for on-demand UI generation, MCP server for AI agent tooling (9 tools) |
| `@uploop-vibe/vibe-devutils` | Inspector, debugger, diff viewer, manifest serializer — DevX for humans & AI |

## Quick Start

```bash
git clone https://github.com/atomixnmc/uploop-vibe-components.git
cd uploop-vibe-components
pnpm install
pnpm dev          # → http://localhost:3100
```

🌐 **Live demo:** [atomixnmc.github.io/uploop-vibe-components](https://atomixnmc.github.io/uploop-vibe-components/)

## AI Agent Integration (MCP)

Vibe exposes 9 tools via Model Context Protocol — AI agents can generate, validate, audit, and diff UIs:

```json
{
  "mcpServers": {
    "vibe": {
      "command": "npx",
      "args": ["@uploop-vibe/vibe-cli", "mcp"]
    }
  }
}
```

**Available tools:** `generate_page`, `generate_component`, `validate_intent`, `audit_manifest`, `list_components`, `list_templates`, `diff_manifests`, `request_component`, `request_queue`

## IFS Loop: Generative HyperGraphs

Vibe uses **Iterated Function Systems** — deterministic graph transformations applied iteratively:

```
Seed Intent → Vibe resolves → G₁ → Audit → AI proposes patches → Vibe applies → G₂ → ... → Converge
```

Every iteration is a pure function. Every graph is versioned. Every transform is validated before application. Loop guards prevent oscillation and stalls.

## 107 Components · 10 Categories + Charts

| Category | Count | Examples |
|----------|-------|----------|
| **Layout** | 12 | Container, Grid, Stack, Flex, Box, Center, AspectRatio, Wrap |
| **Navigation** | 12 | Nav, Dropdown, Tabs, Breadcrumb, Pagination, Stepper, CommandPalette |
| **Data Entry** | 18 | Input, Select, Slider, Switch, PinInput, ColorPicker, Combobox, Rating |
| **Data Display** | 16 | Card, Table, Badge, Avatar, Timeline, TreeView, Accordion, Carousel |
| **Feedback** | 14 | Alert, Toast, Progress, Skeleton, EmptyState, ErrorState, Spotlight |
| **Overlay** | 10 | Modal, Dialog, Drawer, Sheet, Popover, Tooltip, Lightbox |
| **Typography** | 10 | Heading, Text, Code, BlockCode, Kbd, Blockquote, Highlight |
| **Media** | 6 | Icon, Image, Video, Audio, Figure, AvatarGroup |
| **Utility** | 5 | Portal, Transition, FocusTrap, ClickOutside, LazyLoad |
| **DataViz** | 4 | Sparkline, Gauge, StatsCard, TrendIndicator |
| **Button** | 1 | 8 variants × 5 sizes × icon × loading × animation |

### Charts (vibe-charts) — 8 Types

| Type | Use Case |
|------|----------|
| LineChart | Time-series trends, multi-series |
| BarChart | Categorical comparison (vertical + horizontal) |
| HorizontalBarChart | Rankings, top-N lists |
| PieChart | Composition, donut charts |
| AreaChart | Volume over time, stacked areas |
| ScatterPlot | Correlation, bubble charts |
| NetworkGraph | Node-edge graphs, interconnections |
| Heatmap | Color-coded matrix, risk grids |

## Docs

| Document | Description |
|----------|-------------|
| [HOWTO.md](./docs/HOWTO.md) | Developer guide — components, AI intent API, CLI, MCP |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Full architecture — packages, data flow, IFS engine |
| [AI_GUIDELINE.md](./docs/AI_GUIDELINE.md) | Project rules — SDLC, commits, code style |
| [PLAN.md](./docs/PLAN.md) | Development phases v0.1–v0.9 |
| [design/design-ifs-protocol.md](./docs/design/design-ifs-protocol.md) | IFS protocol — generative HyperGraphs |
| [design/design-ai-protocol.md](./docs/design/design-ai-protocol.md) | AI↔Vibe contract |
| [reports/why-vibe-wins-ai-moat.md](./docs/reports/why-vibe-wins-ai-moat.md) | Why AI-first beats 10 years of components |
| [reports/v0.2-compare-frameworks.md](./docs/reports/v0.2-compare-frameworks.md) | MUI, Ant, Chakra, Ark, Daisy comparison |
| [reports/stress-test-ai-protocol.md](./docs/reports/stress-test-ai-protocol.md) | AI protocol stress test — where theory holds/breaks |
| [reports/evaluate-ifs-protocol.md](./docs/reports/evaluate-ifs-protocol.md) | IFS protocol evaluation — scoring, loop guard |

## Companion: Uploop Lang Services

[`@uploop-lang-services`](https://github.com/atomixnmc/uploop-lang-services) provides 11 static checks that catch common Uploop code mistakes before they reach the browser:

- `on*` DOM attributes rendered as visible text
- `node:fs` imports in browser builds
- JSX-style comments in template literals
- Missing `@event` syntax for event handlers
- And 7 more checks

Use it in CI or as a pre-commit hook for zero-surprise deploys.

## License

MIT
