// Dashboard Demo — Full analytics dashboard with 10 chart types

import { html, component } from '@uploop/html'
import { vibeLight, applyVibeTheme } from '@uploop-vibe/vibe'
import { inject } from '@uploop/css'
import {
  LineChart, BarChart, PieChart, AreaChart,
  GaugeChart, FunnelChart,
  RadarChart, WaterfallChart, Heatmap, Treemap,
} from '@uploop-vibe/vibe-charts'

applyVibeTheme(vibeLight)
inject()

function mountChart(ChartClass, config, containerId) {
  const el = document.getElementById(containerId)
  if (!el) return
  el.innerHTML = ''
  const chart = ChartClass.create(config)
  chart.mount(el)
  setTimeout(() => {
    const w = el.clientWidth || config.width || 400
    const h = el.clientHeight || config.height || 280
    chart.loop?.send?.('resize', { width: w, height: h })
  }, 50)
}

// All tab content inlined — no this.viewXxx() calls
function overviewTab(kpis) {
  return html`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem;">
      ${kpis.map(kpi => html`
        <div style="background:white;border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div style="font-size:0.75rem;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.5rem;">${kpi.label}</div>
            <span style="font-size:1.2rem;">${kpi.icon}</span>
          </div>
          <div style="font-size:1.6rem;font-weight:700;margin-bottom:0.2rem;">${kpi.value}</div>
          <div style="font-size:0.78rem;color:${kpi.trend==='up'?'#40c057':'#fa5252'};">
            ${kpi.trend==='up'?'\u2191':'\u2193'} ${kpi.change} vs last month
          </div>
        </div>
      `)}
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:1rem;margin-bottom:1rem;">
      <div style="background:white;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <h3 style="font-size:0.9rem;font-weight:600;margin:0 0 1rem;">Revenue Trend</h3>
        <div id="dash-line" style="width:100%;height:280px;"></div>
      </div>
      <div style="background:white;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <h3 style="font-size:0.9rem;font-weight:600;margin:0 0 1rem;">User Acquisition</h3>
        <div id="dash-pie" style="width:100%;height:280px;"></div>
      </div>

      <div style="background:white;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <h3 style="font-size:0.9rem;font-weight:600;margin:0 0 1rem;">Monthly Sales</h3>
        <div id="dash-bar" style="width:100%;height:260px;"></div>
      </div>
      <div style="background:white;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <h3 style="font-size:0.9rem;font-weight:600;margin:0 0 1rem;">Risk Gauge</h3>
        <div id="dash-gauge" style="width:100%;height:260px;display:flex;justify-content:center;"></div>
      </div>
    </div>
  `
}

function analyticsTab() {
  return html`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
      <div style="background:white;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <h3 style="font-size:0.9rem;font-weight:600;margin:0 0 1rem;">Team Performance Radar</h3>
        <div id="dash-radar" style="width:100%;height:300px;"></div>
      </div>
      <div style="background:white;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <h3 style="font-size:0.9rem;font-weight:600;margin:0 0 1rem;">Revenue Waterfall</h3>
        <div id="dash-waterfall" style="width:100%;height:300px;display:flex;align-items:center;"></div>
      </div>
      <div style="background:white;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <h3 style="font-size:0.9rem;font-weight:600;margin:0 0 1rem;">Conversion Funnel</h3>
        <div id="dash-funnel" style="width:100%;height:280px;"></div>
      </div>
      <div style="background:white;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <h3 style="font-size:0.9rem;font-weight:600;margin:0 0 1rem;">Stacked Revenue</h3>
        <div id="dash-area" style="width:100%;height:280px;"></div>
      </div>
    </div>
  `
}

function performanceTab() {
  return html`
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:1rem;margin-bottom:1rem;">
      <div style="background:white;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <h3 style="font-size:0.9rem;font-weight:600;margin:0 0 1rem;">Risk Heatmap</h3>
        <div id="dash-heatmap" style="width:100%;height:320px;"></div>
      </div>
      <div style="background:white;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <h3 style="font-size:0.9rem;font-weight:600;margin:0 0 1rem;">Revenue by Region</h3>
        <div id="dash-treemap" style="width:100%;height:320px;"></div>
      </div>
    </div>
  `
}

const Dashboard = component('VibeDashboard', {
  state: {
    kpis: [
      { label: 'Revenue', value: '$2.4M', change: '+12%', trend: 'up', icon: '\u{1F4B0}' },
      { label: 'Active Users', value: '18.2K', change: '+8%', trend: 'up', icon: '\u{1F465}' },
      { label: 'Churn Rate', value: '2.1%', change: '-0.5%', trend: 'down', icon: '\u{1F4C9}' },
      { label: 'NPS Score', value: '72', change: '+3', trend: 'up', icon: '\u{2B50}' },
    ],
    activeTab: 'overview',
  },

  update: { setTab: (s, tab) => ({ ...s, activeTab: tab }) },

  view(state) {
    const tabs = ['overview', 'analytics', 'performance']

    // Build tab content based on activeTab
    let tabContent = ''
    if (state.activeTab === 'overview') tabContent = overviewTab(state.kpis)
    else if (state.activeTab === 'analytics') tabContent = analyticsTab()
    else if (state.activeTab === 'performance') tabContent = performanceTab()

    return html`
      <div style="min-height:100vh;background:#f5f6fa;font-family:Inter,system-ui,sans-serif;">
        <header style="background:white;border-bottom:1px solid #e8e8ed;padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:60px;">
          <div style="display:flex;align-items:center;gap:1rem;">
            <a href="/" style="color:#aaa;text-decoration:none;font-size:0.8rem;">\u2190 Home</a>
            <h1 style="font-size:1.15rem;font-weight:700;margin:0;">\u{1F4CA} Analytics Dashboard</h1>
          </div>
          <nav style="display:flex;gap:1.5rem;">
            ${tabs.map(t => html`
              <span data-tab="${t}"
                style="cursor:pointer;font-size:0.82rem;color:${state.activeTab===t?'#646cff':'#888'};font-weight:${state.activeTab===t?600:400};text-transform:capitalize;">${t}</span>
            `)}
          </nav>
        </header>

        <div style="padding:1.5rem 2rem;">
          ${tabContent}
        </div>
      </div>
    `
  mounted(el) {
    // Capture loop for updates
    if (!Dashboard._loop && this.loop) {
      Dashboard._loop = this.loop
    }

    // DOM delegation for tab clicks (avoids timing issue with @click)
    el.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-tab]')
      if (tab && Dashboard._loop) {
        Dashboard._loop.send('setTab', tab.dataset.tab)
      }
    })

    // Mount overview charts initially
    mountChartsForTab('overview')

    // Listen for tab changes
    if (Dashboard._loop) {
      Dashboard._loop.subscribe((s) => {
        if (s.activeTab && s.activeTab !== Dashboard._lastTab) {
          Dashboard._lastTab = s.activeTab
          setTimeout(() => mountChartsForTab(s.activeTab), 80)
        }
      })
    }
  },

function mountChartsForTab(tab) {
  if (tab === 'overview') {
    mountChart(LineChart, {
      data: [420, 460, 390, 520, 480, 550, 510, 590],
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'],
      showDots: true,
    }, 'dash-line')
    mountChart(PieChart, {
      data: [
        { label: 'Organic', value: 45 }, { label: 'Paid Ads', value: 25 },
        { label: 'Social', value: 18 }, { label: 'Referral', value: 12 },
      ],
      donut: true,
    }, 'dash-pie')
    mountChart(BarChart, {
      data: [65, 80, 55, 90, 72, 85],
      labels: ['Mar','Apr','May','Jun','Jul','Aug'],
    }, 'dash-bar')
    mountChart(GaugeChart, {
      value: 72, max: 100,
      label: 'Performance', sub: 'Good',
      leftLabel: 'Low', rightLabel: 'High',
    }, 'dash-gauge')
  }

  if (tab === 'analytics') {
    mountChart(RadarChart, {
      axes: [
        { label: 'Speed', max: 100 }, { label: 'Quality', max: 100 },
        { label: 'Cost', max: 100 }, { label: 'Satisfaction', max: 100 },
        { label: 'Innovation', max: 100 },
      ],
      data: [
        { name: 'Team Alpha', values: [85, 70, 90, 88, 75], color: '#646cff' },
        { name: 'Team Beta',  values: [60, 90, 75, 82, 92], color: '#fa5252' },
      ],
      filled: true, showDots: true,
    }, 'dash-radar')
    mountChart(WaterfallChart, {
      data: [
        { label: 'Q1 Rev', value: 480 }, { label: 'Upsells', value: 120 },
        { label: 'Returns', value: -45 }, { label: 'Discounts', value: -30 },
        { label: 'New MRR', value: 200 }, { label: 'Q2 Total', value: 725, isTotal: true },
      ],
    }, 'dash-waterfall')
    mountChart(FunnelChart, {
      data: [
        { stage: 'Visitors', value: 10000 }, { stage: 'Leads', value: 3500 },
        { stage: 'MQL', value: 1500 }, { stage: 'SQL', value: 600 },
        { stage: 'Won', value: 200 },
      ],
    }, 'dash-funnel')
    mountChart(AreaChart, {
      data: [
        { label: 'Product', values: [30, 42, 35, 50, 45, 55], color: '#646cff' },
        { label: 'Service', values: [20, 25, 28, 32, 30, 38], color: '#40c057' },
      ],
      stacked: true, opacity: 0.3,
    }, 'dash-area')
  }

  if (tab === 'performance') {
    mountChart(Heatmap, {
      data: [
        [0.12, 0.05, 0.08, 0.03],
        [0.03, 0.01, 0.02, 0.06],
        [0.09, 0.15, 0.11, 0.04],
        [0.07, 0.03, 0.05, 0.01],
      ],
      rowLabels: ['Credit', 'Market', 'Operational', 'Liquidity'],
      colLabels: ['Q1', 'Q2', 'Q3', 'Q4'],
      colorScale: ['#15803d', '#ca8a04', '#b91c1c'],
      title: 'Risk Matrix',
    }, 'dash-heatmap')
    mountChart(Treemap, {
      data: {
        name: 'Revenue',
        children: [
          { name: 'Americas', value: 520, children: [
            { name: 'US', value: 350 }, { name: 'Canada', value: 100 }, { name: 'Brazil', value: 70 },
          ]},
          { name: 'EMEA', value: 380, children: [
            { name: 'UK', value: 150 }, { name: 'Germany', value: 130 }, { name: 'France', value: 100 },
          ]},
          { name: 'APAC', value: 250, children: [
            { name: 'Japan', value: 100 }, { name: 'Australia', value: 80 }, { name: 'India', value: 70 },
          ]},
        ],
      },
      title: 'Revenue by Region',
    }, 'dash-treemap')
  }
}

// ── Mount ────────────────────────────────────────────────────

const inst = Dashboard.mount(document.getElementById('app'))

// Capture loop reference for @click handlers
Dashboard._loop = inst.loop
Dashboard._lastTab = 'overview'
