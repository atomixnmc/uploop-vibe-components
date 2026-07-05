# @uploop-vibe/vibe-charts

**19 SVG chart components** for dashboards and data visualization. Deeply integrated with UploopJS — every chart is a reactive HyperGraph node using @uploop/core loops, @uploop/css theming, and state machines for interaction.

## Install

```bash
pnpm add @uploop-vibe/vibe-charts
```

## Chart Types (19)

### Trend & Time
| Chart | Use Case |
|-------|----------|
| LineChart | Time-series, multi-series, target lines |
| AreaChart | Volume over time, stacked areas |
| StockChart | OHLC/candlestick, volume bars, MA overlay |

### Comparison
| Chart | Use Case |
|-------|----------|
| BarChart | Vertical/horizontal, grouped |
| HorizontalBarChart | Rankings, top-N lists |
| BidirectionalBarChart | Population pyramid, back-to-back |
| RadarChart | Multi-dimensional comparison |
| BulletChart | KPI vs target with performance bands |

### Composition
| Chart | Use Case |
|-------|----------|
| PieChart | Donut/pie, side legend |
| Treemap | Hierarchical area, squarified layout |
| WordCloud | Text frequency visualization |

### Flow & Process
| Chart | Use Case |
|-------|----------|
| FunnelChart | Conversion/loss stages with drop rates |
| SankeyChart | Flow magnitude between nodes |
| WaterfallChart | Cumulative positive/negative contributions |

### Distribution & Relation
| Chart | Use Case |
|-------|----------|
| ScatterPlot | XY correlation, bubble size |
| Heatmap | Color-coded matrix, risk grids |
| NetworkGraph | Node-edge graphs, force layout |

### Gauge & Combo
| Chart | Use Case |
|-------|----------|
| GaugeChart | Semi-circle dial, risk scores, KPI dials |
| ComboChart | Stacked bars + line overlay, dual-axis |

## Uploop Integration

Every chart is a full Uploop component:

```js
import { LineChart } from '@uploop-vibe/vibe-charts'

const chart = LineChart.create({
  data: [10, 25, 15, 40, 30],
  labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
  title: 'Revenue',
  theme: { /* override CSS variables */ },
  palette: ['#646cff', '#40c057', '#fab005'],
})

chart.mount(document.getElementById('chart'))

// Reactive updates via loop
chart.loop.send('setData', [12, 28, 18, 42, 33])

// Interaction state machine
chart.loop.send('hover', 2)    // highlight point 2
chart.loop.send('select', 0)   // select point 0
chart.loop.send('resize', { width: 800, height: 400 })

// AI-readable manifest
const manifest = chart.describe()
// { kind: 'uploop-vibe.chart', dataShape: 'number[]', interaction: 'hovered', ... }

// Theming via @uploop/css tokens
// CSS: --vibe-chart-color-0: #ff6b6b; --vibe-chart-title-size: 16px;
```

## Customization

All charts support:
- **CSS variable theming** — fonts, colors, sizes via @uploop/css design tokens
- **Custom palettes** — per-chart or global color arrays
- **ResizeObserver** — auto-resize via `autoResize(chart, container)`
- **Interaction states** — idle, hovered, selected, zoomed
- **Accessibility** — semantic SVG with role="img" and aria-labels

## License

MIT
