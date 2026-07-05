// Chart Data Schemas — typed data contracts using @uploop/schema
// Every chart validates its input against these schemas before rendering.
// AI agents can inspect schemas to understand data requirements.

import { object, array, number, string, optional } from '@uploop/schema'

// ── Primitive data shapes ──────────────────────────────────

/** Single numeric series: [10, 20, 30] */
export const NumberSeries = array(number())

/** Labeled data point: { label: string, value: number, color?: string } */
export const LabeledPoint = object({
  label: string(),
  value: number(),
  color: optional(string()),
})

/** XY data point: { x: number, y: number, r?: number, label?: string } */
export const XYPoint = object({
  x: number(),
  y: number(),
  r: optional(number()),
  label: optional(string()),
  color: optional(string()),
})

/** Multi-series data: [{ name, values, color? }] */
export const MultiSeries = array(object({
  name: optional(string()),
  label: optional(string()),
  values: array(number()),
  color: optional(string()),
}))

// ── Chart-specific schemas ─────────────────────────────────

/** Line/Area chart input */
export const LineData = NumberSeries

/** Bar chart input: either number[] or { label, value, color? }[] */
export const BarData = array(LabeledPoint)

/** Pie chart input */
export const PieData = array(LabeledPoint)

/** Scatter chart input */
export const ScatterData = array(XYPoint)

/** Heatmap input: number[][] */
export const HeatmapData = array(array(number()))

/** Network graph input */
export const NetworkData = {
  nodes: array(object({
    id: string(),
    label: optional(string()),
    size: optional(number()),
    color: optional(string()),
  })),
  edges: array(object({
    source: string(),
    target: string(),
    weight: optional(number()),
    color: optional(string()),
  })),
}

/** Funnel/Waterfall input */
export const StageData = array(object({
  stage: optional(string()),
  label: optional(string()),
  value: number(),
  color: optional(string()),
  isTotal: optional(string()),  // boolean flag for waterfall totals
}))

/** Treemap/Sunburst hierarchical data */
export const TreeNode = object({
  name: string(),
  value: optional(number()),
  color: optional(string()),
  children: optional(array(object({}))),  // recursive
})

/** WordCloud input */
export const WordData = array(object({
  text: string(),
  weight: number(),
  color: optional(string()),
  rotation: optional(number()),
  font: optional(string()),
}))

/** Radar chart input */
export const RadarData = {
  axes: array(object({
    label: string(),
    max: number(),
  })),
  data: array(object({
    name: optional(string()),
    values: array(number()),
    color: optional(string()),
  })),
}

/** Stock/OHLC data */
export const StockData = array(object({
  date: string(),
  open: number(),
  high: number(),
  low: number(),
  close: number(),
  volume: optional(number()),
}))

/** Gauge input */
export const GaugeData = object({
  value: number(),
  max: optional(number()),
  label: optional(string()),
  sub: optional(string()),
  color: optional(string()),
})

/** Sankey data */
export const SankeyData = {
  nodes: array(object({
    id: string(),
    label: optional(string()),
    color: optional(string()),
  })),
  links: array(object({
    source: string(),
    target: string(),
    value: number(),
    color: optional(string()),
  })),
}

/** Bullet chart data */
export const BulletData = object({
  value: number(),
  target: number(),
  max: optional(number()),
  ranges: optional(array(object({
    from: number(),
    to: number(),
    color: optional(string()),
  }))),
  label: optional(string()),
  unit: optional(string()),
})

/** Box plot data */
export const BoxPlotData = array(object({
  label: optional(string()),
  min: number(),
  q1: number(),
  median: number(),
  q3: number(),
  max: number(),
  outliers: optional(array(number())),
  color: optional(string()),
}))

/** Histogram data */
export const HistogramData = array(number())

/** Dual-axes chart input */
export const DualAxesData = {
  bars: array(LabeledPoint),
  line: array(object({ value: number() })),
  leftLabel: optional(string()),
  rightLabel: optional(string()),
}

/** Radial bar data */
export const RadialBarData = array(LabeledPoint)

/** Rose chart data */
export const RoseData = array(LabeledPoint)

// ── Schema registry for AI discovery ────────────────────────

/** Map of chart name → schema, for AI agent inspection */
export const chartSchemas = {
  LineChart:    { data: LineData },
  AreaChart:    { data: MultiSeries },
  BarChart:     { data: BarData },
  PieChart:     { data: PieData },
  ScatterPlot:  { data: ScatterData },
  Heatmap:      { data: HeatmapData },
  NetworkGraph: { data: NetworkData },
  GaugeChart:   { data: GaugeData },
  FunnelChart:  { data: StageData },
  WaterfallChart: { data: StageData },
  RadarChart:   { data: RadarData },
  SankeyChart:  { data: SankeyData },
  StockChart:   { data: StockData },
  Treemap:      { data: TreeNode },
  Sunburst:     { data: TreeNode },
  WordCloud:    { data: WordData },
  BulletChart:  { data: BulletData },
  BoxPlot:      { data: BoxPlotData },
  Histogram:    { data: HistogramData },
  DualAxesChart:{ data: DualAxesData },
  RadialBarChart: { data: RadialBarData },
  RoseChart:    { data: RoseData },
  ComboChart:   { data: null },
  BidirectionalBarChart: { data: null },
  HorizontalBarChart: { data: BarData },
}

/**
 * Get the schema for a chart type (AI agent tool).
 * @param {string} chartName
 * @returns {Object|null}
 */
export function getChartSchema(chartName) {
  return chartSchemas[chartName] || null
}

/**
 * List all schemas (AI agent tool).
 * @returns {string[]}
 */
export function listChartSchemas() {
  return Object.keys(chartSchemas)
}
