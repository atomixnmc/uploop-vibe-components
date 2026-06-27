// ─── DataViz: Sparkline, Gauge, StatsCard, TrendIndicator ─────

import { component } from '@uploop/html'

export const Sparkline = component('VibeSparkline', {
  state: { data: [], width: 120, height: 40, color: 'primary', strokeWidth: 1.5, fillOpacity: 0.1, showDots: false },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const data = Array.isArray(s.data) ? s.data : []
    if (data.length < 2) return `<div style="width:${s.width}px;height:${s.height}px;display:flex;align-items:center;justify-content:center;color:var(--vibe-color-muted);font-size:0.75rem;">No data</div>`
    const min = Math.min(...data), max = Math.max(...data)
    const range = max - min || 1
    const w = s.width, h = s.height
    const pad = s.strokeWidth
    const xStep = (w - pad * 2) / (data.length - 1)
    const points = data.map((v, i) => `${pad + i * xStep},${pad + (h - pad * 2) * (1 - (v - min) / range)}`)
    const path = `M${points.join(' L')}`
    const fillPath = `${path} L${pad + (data.length - 1) * xStep},${h - pad} L${pad},${h - pad} Z`
    return `<svg width="${w}" height="${h}" class="vibe-sparkline" style="display:block;overflow:visible;">
      <defs><linearGradient id="sparkline-grad-${s.color}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--vibe-color-${s.color}600)" stop-opacity="${s.fillOpacity * 2}" />
        <stop offset="100%" stop-color="var(--vibe-color-${s.color}600)" stop-opacity="0" />
      </linearGradient></defs>
      <path d="${fillPath}" fill="url(#sparkline-grad-${s.color})" />
      <path d="${path}" fill="none" stroke="var(--vibe-color-${s.color}600)" stroke-width="${s.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />
      ${s.showDots ? points.map(p => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="2" fill="var(--vibe-color-${s.color}600)" />`).join('') : ''}
    </svg>`
  }
})

export const Gauge = component('VibeGauge', {
  state: { value: 65, min: 0, max: 100, size: 120, strokeWidth: 8, color: 'primary', label: '', showValue: true },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const pct = Math.min(100, Math.max(0, ((s.value - s.min) / (s.max - s.min)) * 100))
    const r = (s.size - s.strokeWidth) / 2
    const circ = 2 * Math.PI * r
    const offset = circ * (1 - pct / 100)
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div class="vibe-gauge" style="display:inline-flex;flex-direction:column;align-items:center;gap:0.5rem;">
      <svg width="${s.size}" height="${s.size}" style="transform:rotate(-90deg);">
        <circle cx="${s.size/2}" cy="${s.size/2}" r="${r}" fill="none" stroke="var(--vibe-color-neutral100)" stroke-width="${s.strokeWidth}" />
        <circle cx="${s.size/2}" cy="${s.size/2}" r="${r}" fill="none" stroke="var(--vibe-color-${s.color}600)" stroke-width="${s.strokeWidth}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round" style="transition:stroke-dashoffset var(--vibe-duration-normal) var(--vibe-easing-out);" />
      </svg>
      <div style="text-align:center;margin-top:-${s.size/2 + 10}px;position:relative;">
        ${s.showValue ? `<div style="font-size:1.5rem;font-weight:var(--vibe-font-weight-bold);">${Math.round(pct)}%</div>` : ''}
        ${s.label ? `<div style="font-size:0.75rem;color:var(--vibe-color-mutedFg);margin-top:0.125rem;">${esc(s.label)}</div>` : ''}
      </div>
    </div>`
  }
})

export const StatsCard = component('VibeStatsCard', {
  state: { label: '', value: '', previousValue: '', icon: '', trend: '', sparklineData: [], variant: 'default' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    const trendNum = s.previousValue ? parseFloat(s.value) - parseFloat(s.previousValue) : 0
    const trendPct = s.previousValue && parseFloat(s.previousValue) !== 0 ? Math.round((trendNum / Math.abs(parseFloat(s.previousValue))) * 100) : null
    const isUp = trendNum >= 0
    const trendColor = isUp ? 'var(--vibe-color-success)' : 'var(--vibe-color-error)'
    const trendIcon = isUp ? '↑' : '↓'
    const variantBg = s.variant === 'primary' ? 'var(--vibe-color-primary50)' : s.variant === 'success' ? '#d3f9d8' : 'transparent'
    return `<div class="vibe-statscard" style="
      padding:1.25rem; background:var(--vibe-color-bg);
      border:1px solid var(--vibe-color-border); border-radius:var(--vibe-radius-lg);
      ${s.variant !== 'default' ? `border-top:3px solid var(--vibe-color-${s.variant === 'primary' ? 'primary600' : s.variant});` : ''}
    ">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:0.75rem;">
        <span style="font-size:0.75rem;color:var(--vibe-color-mutedFg);text-transform:uppercase;letter-spacing:0.5px;font-weight:var(--vibe-font-weight-medium);">${esc(s.label)}</span>
        ${s.icon ? `<span style="font-size:1.25rem;">${esc(s.icon)}</span>` : ''}
      </div>
      <div style="display:flex;align-items:baseline;gap:0.5rem;">
        <span style="font-size:1.75rem;font-weight:var(--vibe-font-weight-bold);line-height:1.2;">${esc(s.value)}</span>
        ${trendPct !== null ? `<span style="font-size:0.8rem;color:${trendColor};font-weight:var(--vibe-font-weight-medium);">${trendIcon} ${Math.abs(trendPct)}%</span>` : ''}
      </div>
      ${s.sparklineData && s.sparklineData.length ? `<div style="margin-top:0.75rem;">${Sparkline.view({ ...s, data: s.sparklineData, width: 200, height: 40 }, {})}</div>` : ''}
    </div>`
  }
})

export const TrendIndicator = component('VibeTrendIndicator', {
  state: { value: 0, direction: 'up', showArrow: true, showValue: true, size: 'md' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const isUp = s.direction === 'up'
    const color = isUp ? 'var(--vibe-color-success)' : 'var(--vibe-color-error)'
    const arrow = isUp ? '↑' : '↓'
    const fs = { sm: '0.75rem', md: '0.85rem', lg: '1rem' }
    return `<span class="vibe-trend" style="
      display:inline-flex;align-items:center;gap:0.25rem;
      color:${color}; font-size:${fs[s.size]}; font-weight:var(--vibe-font-weight-medium);
    ">
      ${s.showArrow ? `<span>${arrow}</span>` : ''}
      ${s.showValue ? `<span>${Math.abs(s.value)}%</span>` : ''}
    </span>`
  }
})
