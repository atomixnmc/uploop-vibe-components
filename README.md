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
  <a href="#"><img src="https://img.shields.io/badge/charts-25-success" alt="Charts"></a>
  <a href="#"><img src="https://img.shields.io/badge/version-v0.3.0-orange" alt="Version"></a>
  <a href="https://github.com/atomixnmc/uploopjs"><img src="https://img.shields.io/badge/powered%20by-UploopJS-646cff" alt="UploopJS"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-purple" alt="License"></a>
</p>

---

**Uploop Vibe** is an **AI-native design framework** built on the HyperGraph architecture. AI generates UIs from intents, Vibe executes via deterministic IFS loops, and every page exports a machine-readable manifest.

Built on [UploopJS](https://github.com/atomixnmc/uploopjs).

```bash
vibe generate page --goal dashboard --entity Product --actions search,create,delete
vibe generate component --type button --label "Save" --variant solid
vibe mcp    # 9 AI agent tools via Model Context Protocol
```

```js
import { generateComponent, runIFSLoop } from '@uploop-vibe/vibe-ai'

const result = await runIFSLoop({
  goal: 'data-management',
  entity: { name: 'User', fields: [...] },
  actions: ['search', 'create', 'edit', 'delete'],
})
// Converged after 3 iterations. Score: 91 (A).
```

## Packages

| Package | Description |
|---------|-------------|
| `@uploop-vibe/vibe` | 107 components, design tokens, theme engine, motion system, layout builder |
| `@uploop-vibe/vibe-ai` | Intent resolver, IFS loop engine, validator, auditor, error system |
| `@uploop-vibe/vibe-charts` | **25 SVG chart types** with uploop/css theming, uploop/schema validation, AI-readable manifests |
| `@uploop-vibe/vibe-cli` | CLI for on-demand UI generation, MCP server (9 tools) |
| `@uploop-vibe/vibe-devutils` | Inspector, debugger, diff viewer, manifest serializer |

## Quick Start

```bash
git clone https://github.com/atomixnmc/uploop-vibe-components.git
cd uploop-vibe-components
pnpm install
pnpm dev          # http://localhost:3100
```

Live demo: [atomixnmc.github.io/uploop-vibe-components](https://atomixnmc.github.io/uploop-vibe-components/)

## 107 Components · 10 Categories

| Category | Count | Examples |
|----------|-------|----------|
| Layout | 12 | Container, Grid, Stack, Flex, Box, Center |
| Navigation | 12 | Nav, Dropdown, Tabs, Breadcrumb, Pagination, CommandPalette |
| Data Entry | 18 | Input, Select, Slider, Switch, PinInput, ColorPicker, Rating |
| Data Display | 16 | Card, Table, Badge, Avatar, Timeline, TreeView, Accordion |
| Feedback | 14 | Alert, Toast, Progress, Skeleton, EmptyState, ErrorState |
| Overlay | 10 | Modal, Dialog, Drawer, Sheet, Popover, Tooltip |
| Typography | 10 | Heading, Text, Code, BlockCode, Kbd, Blockquote |
| Media | 6 | Icon, Image, Video, Audio, Figure, AvatarGroup |
| Utility | 5 | Portal, Transition, FocusTrap, ClickOutside, LazyLoad |
| DataViz | 4 | Sparkline, Gauge, StatsCard, TrendIndicator |
| Button | 1 | 8 variants x 5 sizes x icon x loading x animation |

## Charts (vibe-charts) — 25 Types

**Deep uploop integration:** @uploop/css for injected stylesheets + theme tokens, @uploop/schema for typed data validation, @uploop/core for reactive state.

### Trend & Time
LineChart, AreaChart, StockChart

### Comparison
BarChart, HorizontalBarChart, BidirectionalBarChart, RadarChart, BulletChart, DualAxesChart

### Composition
PieChart, Treemap, WordCloud, Sunburst

### Flow & Process
FunnelChart, SankeyChart, WaterfallChart

### Distribution
ScatterPlot, Heatmap, Histogram, BoxPlot

### Relation
NetworkGraph

### Gauge & Special
GaugeChart, ComboChart, RoseChart, RadialBarChart

```js
import { LineChart, BarChart, PieChart } from '@uploop-vibe/vibe-charts'
import { getChartSchema, listChartSchemas } from '@uploop-vibe/vibe-charts'

// AI: inspect schema before generating chart
const schema = getChartSchema('LineChart')
// { data: NumberSchema } -- typed contract

// Mount chart with CSS class-based styling
LineChart.create({ data: [10, 20, 30], labels: ['A','B','C'] }).mount(el)

// Dynamic updates via loop
chart.loop.send('setData', [15, 25, 35])
chart.loop.send('setTheme', { titleSize: '16px', barRadius: '6px' })
```

## AI Agent Integration (MCP)

9 tools via Model Context Protocol:

```
generate_page  generate_component  validate_intent  audit_manifest
list_components  list_templates  diff_manifests  request_component
request_queue
```

```json
{ "mcpServers": { "vibe": { "command": "npx", "args": ["@uploop-vibe/vibe-cli", "mcp"] } } }
```

## IFS Loop: Generative HyperGraphs

```
Seed Intent -- Vibe resolves -- G1 -- Audit -- AI patches -- Vibe applies -- G2 -- ... -- Converge
```

Pure functions. Versioned graphs. Validated transforms. Loop guards prevent oscillation and stalls.

## Docs

| Document | Description |
|----------|-------------|
| [HOWTO.md](./docs/HOWTO.md) | Components, AI intent API, CLI, MCP, charts, schemas |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Full architecture |
| [AI_GUIDELINE.md](./docs/AI_GUIDELINE.md) | Project rules |
| [PLAN.md](./docs/PLAN.md) | Development phases v0.1-v0.9 |
| [design/design-ifs-protocol.md](./docs/design/design-ifs-protocol.md) | IFS protocol |
| [design/design-ai-protocol.md](./docs/design/design-ai-protocol.md) | AI-Vibe contract |
| [reports/why-vibe-wins-ai-moat.md](./docs/reports/why-vibe-wins-ai-moat.md) | AI-first vs 10 years of components |
| [reports/v0.2-compare-frameworks.md](./docs/reports/v0.2-compare-frameworks.md) | MUI, Ant, Chakra, Ark, Daisy |
| [reports/stress-test-ai-protocol.md](./docs/reports/stress-test-ai-protocol.md) | AI protocol stress test |
| [reports/evaluate-ifs-protocol.md](./docs/reports/evaluate-ifs-protocol.md) | IFS evaluation |

## Companion

[@uploop-lang-services](https://github.com/atomixnmc/uploop-lang-services) — 11 static checks for Uploop code.

## License

MIT
