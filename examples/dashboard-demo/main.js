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
    return html`
      <div style="min-height:100vh;background:#f5f6fa;font-family:Inter,system-ui,sans-serif;">
        <header style="background:white;border-bottom:1px solid #e8e8ed;padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:60px;">
          <div style="display:flex;align-items:center;gap:1rem;">
            <a href="/" style="color:#aaa;text-decoration:none;font-size:0.8rem;">\u2190 Home</a>
            <h1 style="font-size:1.15rem;font-weight:700;margin:0;">\u{1F4CA} Analytics Dashboard</h1>
          </div>
          <nav style="display:flex;gap:1.5rem;">
            ${tabs.map(t => html`
              <span @click=${() => this.loop.send('setTab', t)}
                style="cursor:pointer;font-size:0.82rem;color:${state.activeTab===t?'#646cff':'#888'};font-weight:${state.activeTab===t?600:400};text-transform:capitalize;">${t}</span>
            `)}
          </nav>
        </header>

        <div style="padding:1.5rem 2rem;">
          ${state.activeTab === 'overview' ? this.viewOverview(state) : ''}
          ${state.activeTab === 'analytics' ? this.viewAnalytics(state) : ''}
          ${state.activeTab === 'performance' ? this.viewPerformance(state) : ''}
        </div>
      </div>
    `
  },

  viewOverview(state) {
    return html`
      <!-- KPI Row -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem;">
        ${state.kpis.map(kpi => html`
          <div style="background:white;border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);transition:box-shadow 0.2s;"
               onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'"
               onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.06)'">
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

      <!-- Charts Grid -->
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
  },

  viewAnalytics(state) {
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
  },

  viewPerformance(state) {
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
  },

  mounted(el) {
    // Tab: Overview
    if (document.getElementById('dash-line')) {
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

    // Tab: Analytics (mounted lazily on first visit)
  },

  // Override loop.send to catch tab changes and mount charts
  _originalSend: null,
})

// Post-mount: intercept tab switching to mount charts on-demand
const origMount = Dashboard.mount
Dashboard.mount = function(el) {
  const inst = origMount.call(this, el)

  // Wrap loop.send to detect tab switches
  const origSend = inst.loop.send.bind(inst.loop)
  inst.loop.send = function(action, ...args) {
    const result = origSend(action, ...args)

    if (action === 'transition' && args[0] === 'setTab') {
      const tab = args[1]
      setTimeout(() => mountChartsForTab(tab), 80)
    }

    return result
  }

  // Initial mount
  setTimeout(() => mountChartsForTab('overview'), 100)

  return inst
}

function mountChartsForTab(tab) {
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
        { label: 'Q1 Rev', value: 480 },
        { label: 'Upsells', value: 120 },
        { label: 'Returns', value: -45 },
        { label: 'Discounts', value: -30 },
        { label: 'New MRR', value: 200 },
        { label: 'Q2 Total', value: 725, isTotal: true },
      ],
    }, 'dash-waterfall')

    mountChart(FunnelChart, {
      data: [
        { stage: 'Visitors', value: 10000 },
        { stage: 'Leads', value: 3500 },
        { stage: 'MQL', value: 1500 },
        { stage: 'SQL', value: 600 },
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

// Mount
Dashboard.mount(document.getElementById('app'))
