// ─── @uploop-vibe/vibe-charts StockChart ─────────────────────
// OHLC / Candlestick chart for financial time series.
// Supports candlestick or OHLC bar rendering, optional volume bars
// at the bottom, and optional simple moving average (MA5) overlay.

import { component } from '@uploop/html'
import { getColor } from './utils.js'

const UP_COLOR = '#22c55e'
const DOWN_COLOR = '#ef4444'
const VOLUME_COLOR = 'var(--vibe-color-neutral300)'

export const StockChart = component('VibeStockChart', {
  state: {
    data: [],            // { date, open, high, low, close, volume? }[]
    width: 600,
    height: 400,
    type: 'candlestick', // 'candlestick' | 'ohlc'
    showVolume: true,
    title: '',
    upColor: UP_COLOR,
    downColor: DOWN_COLOR,
    showMA: false,       // show simple MA5 line
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, width, height, type, showVolume, title, upColor, downColor, showMA } = state
    const w = width, h = height
    const records = Array.isArray(data) ? data : []

    if (!records.length) {
      return `<svg width="${w}" height="${h}"><text x="${w/2}" y="${h/2}" text-anchor="middle" fill="var(--vibe-color-muted)">No data</text></svg>`
    }

    const pad = { top: title ? 36 : 16, right: 16, bottom: 30, left: 50 }
    const volumeHeight = showVolume ? Math.min(60, h * 0.18) : 0
    const chartH = h - pad.top - pad.bottom - volumeHeight
    const chartW = w - pad.left - pad.right - 10 // extra right pad for last candle

    // ── Price range ──
    const allHighs = records.map(r => r.high)
    const allLows = records.map(r => r.low)
    const priceMin = Math.min(...allLows)
    const priceMax = Math.max(...allHighs)
    const priceRange = priceMax - priceMin || 1
    const pricePad = priceRange * 0.05 // 5% padding
    const yMin = priceMin - pricePad
    const yMax = priceMax + pricePad
    const yRange = yMax - yMin

    // ── Volume range ──
    let volMax = 1
    if (showVolume) {
      const volumes = records.map(r => r.volume || 0)
      volMax = Math.max(1, ...volumes)
    }

    // ── Bar positioning ──
    const barSpacing = chartW / Math.max(1, records.length)
    const candleWidth = Math.max(1, barSpacing * 0.6)
    const gap = (barSpacing - candleWidth) / 2

    // ── MA5 ──
    const ma5 = showMA ? computeMA5(records.map(r => r.close)) : null

    // ── SVG ──
    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${w / 2}" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    // ── Y-axis price labels ──
    const yTicks = computePriceTicks(yMin, yMax, 5)
    svg += yTicks.map(t => {
      const yy = pad.top + chartH - ((t - yMin) / yRange) * chartH
      return `<text x="${pad.left - 6}" y="${(yy + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--vibe-color-mutedFg)">${fmtPrice(t)}</text>`
    }).join('')

    // ── Grid lines ──
    svg += yTicks.map(t => {
      const yy = pad.top + chartH - ((t - yMin) / yRange) * chartH
      return `<line x1="${pad.left}" y1="${yy.toFixed(1)}" x2="${(w - pad.right).toFixed(1)}" y2="${yy.toFixed(1)}" stroke="var(--vibe-color-neutral200)" stroke-width="1" stroke-dasharray="3,3"/>`
    }).join('')

    // ── Separator line for volume section ──
    if (showVolume) {
      const sepY = pad.top + chartH
      svg += `<line x1="${pad.left}" y1="${sepY.toFixed(1)}" x2="${(w - pad.right).toFixed(1)}" y2="${sepY.toFixed(1)}" stroke="var(--vibe-color-neutral200)" stroke-width="1"/>`
    }

    // ── Volume bars ──
    if (showVolume) {
      svg += records.map((r, i) => {
        const volume = r.volume || 0
        const barH = (volume / volMax) * (volumeHeight - 4)
        const x = pad.left + i * barSpacing + gap
        const y = pad.top + chartH + volumeHeight - barH
        const isUp = r.close >= r.open
        const vColor = isUp ? upColor : downColor
        return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${candleWidth.toFixed(1)}" height="${Math.max(1, barH).toFixed(1)}" fill="${vColor}" opacity="0.35" rx="1"/>`
      }).join('')
    }

    // ── Candles / OHLC ──
    if (type === 'ohlc') {
      svg += records.map((r, i) => {
        const x = pad.left + i * barSpacing + barSpacing / 2
        const yOpen = pad.top + chartH - ((r.open - yMin) / yRange) * chartH
        const yClose = pad.top + chartH - ((r.close - yMin) / yRange) * chartH
        const yHigh = pad.top + chartH - ((r.high - yMin) / yRange) * chartH
        const yLow = pad.top + chartH - ((r.low - yMin) / yRange) * chartH
        const isUp = r.close >= r.open
        const color = isUp ? upColor : downColor
        const tickW = candleWidth * 0.8

        return [
          // High-low line
          `<line x1="${x.toFixed(1)}" y1="${yHigh.toFixed(1)}" x2="${x.toFixed(1)}" y2="${yLow.toFixed(1)}" stroke="${color}" stroke-width="1"/>`,
          // Open tick (left)
          `<line x1="${(x - tickW / 2).toFixed(1)}" y1="${yOpen.toFixed(1)}" x2="${x.toFixed(1)}" y2="${yOpen.toFixed(1)}" stroke="${color}" stroke-width="1.5"/>`,
          // Close tick (right)
          `<line x1="${x.toFixed(1)}" y1="${yClose.toFixed(1)}" x2="${(x + tickW / 2).toFixed(1)}" y2="${yClose.toFixed(1)}" stroke="${color}" stroke-width="1.5"/>`,
        ].join('')
      }).join('')
    } else {
      // Candlestick
      svg += records.map((r, i) => {
        const x = pad.left + i * barSpacing + barSpacing / 2
        const yOpen = pad.top + chartH - ((r.open - yMin) / yRange) * chartH
        const yClose = pad.top + chartH - ((r.close - yMin) / yRange) * chartH
        const yHigh = pad.top + chartH - ((r.high - yMin) / yRange) * chartH
        const yLow = pad.top + chartH - ((r.low - yMin) / yRange) * chartH
        const isUp = r.close >= r.open
        const fillColor = isUp ? upColor : downColor

        const bodyTop = Math.min(yOpen, yClose)
        const bodyH = Math.max(1, Math.abs(yClose - yOpen))
        const bodyX = x - candleWidth / 2

        return [
          // Wick (high-low line)
          `<line x1="${x.toFixed(1)}" y1="${yHigh.toFixed(1)}" x2="${x.toFixed(1)}" y2="${yLow.toFixed(1)}" stroke="${fillColor}" stroke-width="1"/>`,
          // Body
          `<rect x="${bodyX.toFixed(1)}" y="${bodyTop.toFixed(1)}" width="${candleWidth.toFixed(1)}" height="${bodyH.toFixed(1)}" fill="${fillColor}" opacity="0.9" rx="1"/>`,
        ].join('')
      }).join('')
    }

    // ── Moving Average (MA5) ──
    if (showMA && ma5 && ma5.length > 1) {
      const maPoints = ma5.map((v, i) => {
        if (v == null) return ''
        const x = pad.left + i * barSpacing + barSpacing / 2
        const y = pad.top + chartH - ((v - yMin) / yRange) * chartH
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      }).filter(Boolean)

      if (maPoints.length > 0) {
        svg += `<path d="${maPoints.join(' ')}" fill="none" stroke="#3b82f6" stroke-width="1.5" opacity="0.8"/>`
        // Legend dot
        svg += `<circle cx="${(pad.left + 6).toFixed(1)}" cy="${(pad.top + 12).toFixed(1)}" r="3" fill="#3b82f6" opacity="0.8"/>`
        svg += `<text x="${(pad.left + 13).toFixed(1)}" y="${(pad.top + 16).toFixed(1)}" font-size="9" fill="#3b82f6">MA5</text>`
      }
    }

    // ── X-axis date labels ──
    const dateStep = Math.max(1, Math.floor(records.length / 8))
    svg += records.map((r, i) => {
      if (i % dateStep !== 0 && i !== records.length - 1) return ''
      const x = pad.left + i * barSpacing + barSpacing / 2
      const label = fmtDate(r.date)
      return `<text x="${x.toFixed(1)}" y="${(h - pad.bottom + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--vibe-color-mutedFg)">${esc(label)}</text>`
    }).join('')

    svg += '</svg>'
    return svg
  },
})

// ── Helpers ───────────────────────────────────────────────────

function computeMA5(prices) {
  const result = []
  for (let i = 0; i < prices.length; i++) {
    if (i < 4) { result.push(null); continue }
    const slice = prices.slice(i - 4, i + 1)
    const sum = slice.reduce((a, b) => a + b, 0)
    result.push(sum / 5)
  }
  return result
}

function computePriceTicks(min, max, count) {
  const range = max - min || 1
  const step = range / (count - 1)
  const ticks = []
  for (let i = 0; i < count; i++) {
    ticks.push(min + step * i)
  }
  return ticks
}

function fmtPrice(v) {
  if (v >= 1000) return v.toFixed(0)
  if (v >= 1) return v.toFixed(2)
  return v.toFixed(4)
}

function fmtDate(date) {
  if (!date) return ''
  const s = String(date)
  // If already short like "Jan 15", return as-is
  if (s.length <= 8) return s
  // Try to parse and return MM-DD
  const d = new Date(s)
  if (isNaN(d.getTime())) return s.substring(0, 6)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
