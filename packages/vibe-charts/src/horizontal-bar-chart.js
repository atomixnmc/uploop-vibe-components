// ─── @uploop-vibe/vibe-charts HorizontalBarChart ──────────────
// Convenience wrapper — pre-configures BarChart with horizontal layout.
// Ideal for rankings, top-N lists, comparison bars.

import { BarChart } from './bar-chart.js'

export const HorizontalBarChart = component('VibeHBarChart', {
  ...BarChart,
  // Override name for registry
  name: 'VibeHBarChart',

  // Force horizontal mode
  create(props = {}) {
    return BarChart.create({
      ...props,
      horizontal: true,
      // Wider default for horizontal labels
      width: props.width || 500,
      height: props.height || Math.max(200, (props.data?.length || 5) * 36),
    })
  },
})

// Re-use component() from uploop
import { component } from '@uploop/html'
