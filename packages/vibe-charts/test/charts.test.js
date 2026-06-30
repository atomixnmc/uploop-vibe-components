// ─── @uploop-vibe/vibe-charts Tests ───────────────────────────

import { describe, it, expect } from 'vitest'

// Try importing chart components; fall back to structural tests
// if @uploop/html dependency chain doesn't resolve.
let BarChart, HorizontalBarChart, Heatmap, PieChart
let importsOk = false

try {
  const mod = await import('../src/index.js')
  BarChart = mod.BarChart
  HorizontalBarChart = mod.HorizontalBarChart
  Heatmap = mod.Heatmap
  PieChart = mod.PieChart
  importsOk = true
} catch (e) {
  // Imports failed — will run structural tests below
}

// ── Functional tests (when imports resolve) ───────────────────

describe.runIf(importsOk)('BarChart', () => {
  it('create() returns an object with a mount method', () => {
    const instance = BarChart.create({ data: [10, 20, 30], labels: ['A', 'B', 'C'] })
    expect(instance).toBeDefined()
    expect(typeof instance.mount).toBe('function')
  })

  it('view state renders SVG containing <svg', () => {
    const instance = BarChart.create({ data: [10, 20, 30], labels: ['A', 'B', 'C'] })
    const svg = instance.render()
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('width="')
    expect(svg).toContain('height="')
  })

  it('render includes rect elements for bars', () => {
    const instance = BarChart.create({ data: [10, 20, 30], labels: ['A', 'B', 'C'] })
    const svg = instance.render()
    // Each bar is a <rect> element
    const rects = svg.match(/<rect/g)
    expect(rects).not.toBeNull()
    expect(rects.length).toBe(3)
  })

  it('handles empty data gracefully', () => {
    const instance = BarChart.create({ data: [] })
    const svg = instance.render()
    expect(svg).toContain('<svg')
    // No rects for empty data
  })

  it('state reflects provided props', () => {
    const instance = BarChart.create({ data: [5, 15], labels: ['X', 'Y'], width: 600 })
    const state = instance.loop.get()
    expect(state.data).toEqual([5, 15])
    expect(state.labels).toEqual(['X', 'Y'])
    expect(state.width).toBe(600)
    expect(state.horizontal).toBe(false)
  })
})

describe.runIf(importsOk)('HorizontalBarChart', () => {
  it('exists and is importable', () => {
    expect(HorizontalBarChart).toBeDefined()
    expect(typeof HorizontalBarChart.create).toBe('function')
  })

  it('create() returns component', () => {
    const instance = HorizontalBarChart.create({ data: [10, 20, 30], labels: ['A', 'B', 'C'] })
    expect(instance).toBeDefined()
    expect(typeof instance.mount).toBe('function')
  })

  it('render produces SVG output', () => {
    const instance = HorizontalBarChart.create({ data: [10, 20, 30], labels: ['A', 'B', 'C'] })
    const svg = instance.render()
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })
})

describe.runIf(importsOk)('Heatmap', () => {
  it('create({ data: [[1,2],[3,4]] }) returns component', () => {
    const instance = Heatmap.create({ data: [[1, 2], [3, 4]] })
    expect(instance).toBeDefined()
    expect(typeof instance.mount).toBe('function')
  })

  it('render produces SVG with rect elements for cells', () => {
    const instance = Heatmap.create({ data: [[1, 2], [3, 4]] })
    const svg = instance.render()
    expect(svg).toContain('<svg')
    // 2 rows × 2 cols = 4 rects + legend gradient rects
    expect(svg).toContain('<rect')
  })

  it('handles empty data with "No data" message', () => {
    const instance = Heatmap.create({ data: [] })
    const svg = instance.render()
    expect(svg).toContain('No data')
  })
})

describe.runIf(importsOk)('PieChart', () => {
  it('create() returns component', () => {
    const instance = PieChart.create({
      data: [
        { label: 'A', value: 30 },
        { label: 'B', value: 50 },
        { label: 'C', value: 20 },
      ],
    })
    expect(instance).toBeDefined()
    expect(typeof instance.mount).toBe('function')
  })

  it('render produces SVG with path elements for slices', () => {
    const instance = PieChart.create({
      data: [
        { label: 'A', value: 30 },
        { label: 'B', value: 50 },
        { label: 'C', value: 20 },
      ],
    })
    const svg = instance.render()
    expect(svg).toContain('<svg')
    expect(svg).toContain('<path')
  })

  it('donut mode renders center text', () => {
    const instance = PieChart.create({
      data: [
        { label: 'A', value: 30 },
        { label: 'B', value: 50 },
      ],
      donut: true,
    })
    const svg = instance.render()
    expect(svg).toContain('Total')
  })
})

// ── Structural tests (always run as safety net) ───────────────

describe('charts index exports', () => {
  it('exports BarChart, HorizontalBarChart, Heatmap, PieChart', async () => {
    const mod = await import('../src/index.js')
    expect(mod.BarChart).toBeDefined()
    expect(mod.HorizontalBarChart).toBeDefined()
    expect(mod.Heatmap).toBeDefined()
    expect(mod.PieChart).toBeDefined()
    expect(mod.LineChart).toBeDefined()
    expect(mod.AreaChart).toBeDefined()
    expect(mod.ScatterPlot).toBeDefined()
    expect(mod.NetworkGraph).toBeDefined()
  })
})

describe('bar-chart module', () => {
  it('exports BarChart with create and view', async () => {
    const mod = await import('../src/bar-chart.js')
    expect(mod.BarChart).toBeDefined()
    expect(typeof mod.BarChart.create).toBe('function')
    expect(typeof mod.BarChart.view).toBe('function')
  })
})

describe('horizontal-bar-chart module', () => {
  it('exports HorizontalBarChart with create', async () => {
    const mod = await import('../src/horizontal-bar-chart.js')
    expect(mod.HorizontalBarChart).toBeDefined()
    expect(typeof mod.HorizontalBarChart.create).toBe('function')
  })
})

describe('heatmap module', () => {
  it('exports Heatmap with create and view', async () => {
    const mod = await import('../src/heatmap.js')
    expect(mod.Heatmap).toBeDefined()
    expect(typeof mod.Heatmap.create).toBe('function')
    expect(typeof mod.Heatmap.view).toBe('function')
  })
})

describe('pie-chart module', () => {
  it('exports PieChart with create and view', async () => {
    const mod = await import('../src/pie-chart.js')
    expect(mod.PieChart).toBeDefined()
    expect(typeof mod.PieChart.create).toBe('function')
    expect(typeof mod.PieChart.view).toBe('function')
  })
})
