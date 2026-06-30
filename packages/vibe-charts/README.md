# @uploop-vibe/vibe-charts

**SVG chart components** for dashboards and data visualization. Built on Uploop's `component()` pattern — every chart is a typed graph node with `mount()`, `describe()`, and `loop.send()`.

## Install

```bash
pnpm add @uploop-vibe/vibe-charts
```

## Chart Types (8)

| Chart | Use Case | Key Props |
|-------|----------|-----------|
| **LineChart** | Time-series trends, multi-series comparison | `data`, `labels`, `showDots`, `smooth` |
| **BarChart** | Categorical comparison, rankings | `data`, `labels`, `horizontal`, `barGap` |
| **HorizontalBarChart** | Rankings, top-N lists (convenience wrapper) | `data`, `labels` (auto-horizontal) |
| **PieChart** | Composition, share-of-total | `data`, `donut`, `innerRadius` |
| **AreaChart** | Volume over time, stacked trends | `data`, `stacked`, `opacity`, `showDots` |
| **ScatterPlot** | Correlation, XY positioning, bubble size | `data` (x,y,r objects), `quadrants` |
| **NetworkGraph** | Node-edge graphs, interconnections | `nodes`, `edges`, `layout` (circular/grid/manual) |
| **Heatmap** | Color-coded matrix, risk grids, correlation | `data` (2D array), `rowLabels`, `colLabels`, `colorScale` |

All charts are **inline SVG** — no canvas, no external dependencies.

## Quick Start

```js
import { LineChart, BarChart, PieChart } from '@uploop-vibe/vibe-charts'

// Line chart
const line = LineChart.create({
  data: [10, 25, 15, 40, 30],
  labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
  title: 'Revenue',
  showDots: true,
})
line.mount(document.getElementById('chart1'))

// Bar chart
const bar = BarChart.create({
  data: [
    { label: 'VCB', value: 12.5 },
    { label: 'BIDV', value: 9.8 },
    { label: 'CTG', value: 10.2 },
  ],
  title: 'CAR by Bank',
  color: 'primary',
})
bar.mount(document.getElementById('chart2'))

// Pie chart
const pie = PieChart.create({
  data: [
    { label: 'Loans', value: 65 },
    { label: 'Securities', value: 20 },
    { label: 'Cash', value: 15 },
  ],
  donut: true,
  title: 'Asset Allocation',
})
pie.mount(document.getElementById('chart3'))
```

## Dynamic Updates

```js
const chart = LineChart.create({ data: [1, 2, 3], labels: ['A', 'B', 'C'] })
chart.mount(el)

// Update data
chart.loop.send('setData', [4, 5, 6, 7])

// Reconfigure
chart.loop.send('configure', { title: 'Updated', showDots: false })

// Inspect (AI-readable)
const manifest = chart.describe()
```

## Heatmap

```js
import { Heatmap } from '@uploop-vibe/vibe-charts'

const heat = Heatmap.create({
  data: [
    [0.12, 0.05, 0.08],
    [0.03, 0.01, 0.02],
    [0.09, 0.15, 0.11],
  ],
  rowLabels: ['Credit Risk', 'Market Risk', 'Operational Risk'],
  colLabels: ['Q1', 'Q2', 'Q3'],
  title: 'Risk Heatmap',
  colorScale: ['#15803d', '#ca8a04', '#b91c1c'],  // green→yellow→red
})
heat.mount(el)
```

## Network Graph

```js
import { NetworkGraph } from '@uploop-vibe/vibe-charts'

const graph = NetworkGraph.create({
  nodes: [
    { id: 'VCB', label: 'Vietcombank', size: 20 },
    { id: 'BIDV', label: 'BIDV', size: 18 },
    { id: 'CTG', label: 'CTG', size: 16 },
  ],
  edges: [
    { from: 'VCB', to: 'BIDV', weight: 0.8 },
    { from: 'VCB', to: 'CTG', weight: 0.6 },
  ],
  layout: 'circular',
})
graph.mount(el)
```

## Integration with Vibe DataViz

Vibe core also includes lightweight inline charts for KPI cards:

```js
import { Sparkline, Gauge, StatsCard, TrendIndicator } from '@uploop-vibe/vibe'
```

Use `vibe-charts` for full-page analytical charts. Use `vibe` DataViz for compact KPI summaries.

## License

MIT
