// Charts Showcase — 25 chart types, left-nav, live demos

import { component } from "@uploop/html";
import { inject } from "@uploop/css";
import { vibeLight, applyVibeTheme } from "@uploop-vibe/vibe";
import {
  Histogram,
  BoxPlot,
  Sunburst,
  DualAxesChart,
  RoseChart,
  RadialBarChart,
  LineChart,
  BarChart,
  HorizontalBarChart,
  PieChart,
  AreaChart,
  ScatterPlot,
  NetworkGraph,
  Heatmap,
  GaugeChart,
  ComboChart,
  RadarChart,
  FunnelChart,
  WaterfallChart,
  SankeyChart,
  StockChart,
  BidirectionalBarChart,
  Treemap,
  WordCloud,
  BulletChart,
} from "@uploop-vibe/vibe-charts";

applyVibeTheme(vibeLight);
inject();

// Shared mount helper
function mountInto(chart, containerId) {
  const el = document.getElementById(containerId);
  if (el) {
    el.innerHTML = "";
    chart.mount(el);
    // Auto-resize to fill container
    setTimeout(() => {
      const w = el.clientWidth || 500;
      const h = el.clientHeight || 300;
      chart.loop?.send("resize", { width: w, height: h });
    }, 50);
  }
}

// ── Chart Catalog ────────────────────────────────────────────

const catalog = [
  {
    category: "Trend & Time",
    icon: "\u{1F4C8}",
    desc: "Time-series analysis, forecasting, and financial charts.",
    charts: [
      {
        name: "LineChart",
        desc: "Time-series trends with multi-series support.",
        mount() {
          mountInto(
            LineChart.create({
              data: [420, 460, 390, 520, 480, 550, 510, 590],
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
              showDots: true,
            }),
            "demo-line",
          );
        },
        code: `LineChart.create({
  data: [420, 460, 390, 520, 480, 550, 510, 590],
  labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'],
  showDots: true,
})`,
        demoId: "demo-line",
      },
      {
        name: "AreaChart",
        desc: "Volume over time with stacked area support.",
        mount() {
          mountInto(
            AreaChart.create({
              data: [
                {
                  label: "Organic",
                  values: [30, 40, 35, 50, 45, 60],
                  color: "#646cff",
                },
                {
                  label: "Paid",
                  values: [20, 25, 22, 30, 28, 35],
                  color: "#40c057",
                },
              ],
              stacked: true,
              opacity: 0.3,
              showDots: true,
            }),
            "demo-area",
          );
        },
        code: `AreaChart.create({
  data: [
    { label: 'Organic', values: [30,40,35,50,45,60], color: '#646cff' },
    { label: 'Paid',    values: [20,25,22,30,28,35], color: '#40c057' },
  ],
  stacked: true, opacity: 0.3, showDots: true,
})`,
        demoId: "demo-area",
      },
      {
        name: "StockChart",
        desc: "OHLC candlestick chart with volume and MA overlay.",
        mount() {
          mountInto(
            StockChart.create({
              data: [
                { date: "Mon", open: 100, high: 110, low: 95, close: 105 },
                { date: "Tue", open: 105, high: 115, low: 102, close: 112 },
                { date: "Wed", open: 112, high: 118, low: 108, close: 110 },
                { date: "Thu", open: 110, high: 120, low: 106, close: 118 },
                { date: "Fri", open: 118, high: 125, low: 115, close: 122 },
              ],
              type: "candlestick",
              showVolume: true,
              showMA: true,
              title: "Stock Price",
              width: 520,
              height: 280,
            }),
            "demo-stock",
          );
        },
        code: `StockChart.create({
  data: [{ date:'Mon', open:100, high:110, low:95, close:105 }, ...],
  type: 'candlestick', showVolume: true, showMA: true,
})`,
        demoId: "demo-stock",
      },
    ],
  },
  {
    category: "Comparison",
    icon: "\u{1F4CA}",
    desc: "Compare values across categories, dimensions, and targets.",
    charts: [
      {
        name: "BarChart",
        desc: "Vertical or horizontal categorical comparison.",
        mount() {
          mountInto(
            BarChart.create({
              data: [65, 80, 55, 90, 72, 85],
              labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
            }),
            "demo-bar",
          );
        },
        code: `BarChart.create({
  data: [65, 80, 55, 90, 72, 85],
  labels: ['Mar','Apr','May','Jun','Jul','Aug'],
})`,
        demoId: "demo-bar",
      },
      {
        name: "HorizontalBarChart",
        desc: "Rankings and top-N lists with horizontal bars.",
        mount() {
          mountInto(
            HorizontalBarChart.create({
              data: [
                { label: "Product A", value: 95 },
                { label: "Product B", value: 82 },
                { label: "Product C", value: 78 },
                { label: "Product D", value: 65 },
              ],
              title: "Top Products",
            }),
            "demo-hbar",
          );
        },
        code: `HorizontalBarChart.create({
  data: [{ label:'Product A', value:95 }, { label:'Product B', value:82 }, ...],
  title: 'Top Products',
})`,
        demoId: "demo-hbar",
      },
      {
        name: "BidirectionalBarChart",
        desc: "Back-to-back comparison (e.g., population pyramid).",
        mount() {
          mountInto(
            BidirectionalBarChart.create({
              left: [
                { label: "18-24", value: 12 },
                { label: "25-34", value: 18 },
                { label: "35-44", value: 14 },
              ],
              right: [
                { label: "18-24", value: 10 },
                { label: "25-34", value: 16 },
                { label: "35-44", value: 15 },
              ],
              leftLabel: "Male",
              rightLabel: "Female",
            }),
            "demo-bidirectional",
          );
        },
        code: `BidirectionalBarChart.create({
  left:  [{ label:'18-24', value:12 }, ...],
  right: [{ label:'18-24', value:10 }, ...],
  leftLabel: 'Male', rightLabel: 'Female',
})`,
        demoId: "demo-bidirectional",
      },
      {
        name: "RadarChart",
        desc: "Multi-dimensional comparison across axes.",
        mount() {
          mountInto(
            RadarChart.create({
              axes: [
                { label: "Speed", max: 100 },
                { label: "Power", max: 100 },
                { label: "Accuracy", max: 100 },
                { label: "Defense", max: 100 },
                { label: "Stamina", max: 100 },
              ],
              data: [
                {
                  name: "Player A",
                  values: [85, 70, 90, 60, 80],
                  color: "#646cff",
                },
                {
                  name: "Player B",
                  values: [60, 90, 75, 85, 70],
                  color: "#fa5252",
                },
              ],
              filled: true,
              showDots: true,
            }),
            "demo-radar",
          );
        },
        code: `RadarChart.create({
  axes: [{ label:'Speed',max:100 }, ...],
  data: [
    { name:'Player A', values:[85,70,90,60,80], color:'#646cff' },
    { name:'Player B', values:[60,90,75,85,70], color:'#fa5252' },
  ],
  filled: true, showDots: true,
})`,
        demoId: "demo-radar",
      },
      {
        name: "BulletChart",
        desc: "KPI vs target with performance bands (Stephen Few design).",
        mount() {
          mountInto(
            BulletChart.create({
              value: 72,
              target: 80,
              max: 100,
              ranges: [
                { from: 0, to: 50, color: "#fa5252" },
                { from: 50, to: 75, color: "#fab005" },
                { from: 75, to: 100, color: "#40c057" },
              ],
              label: "Revenue YTD",
              unit: "%",
            }),
            "demo-bullet",
          );
        },
        code: `BulletChart.create({
  value: 72, target: 80, max: 100,
  ranges: [{ from:0,to:50,color:'#fa5252' }, ...],
  label: 'Revenue YTD', unit: '%',
})`,
        demoId: "demo-bullet",
      },
    ],
  },
  {
    category: "Composition",
    icon: "\u{1F967}",
    desc: "Part-to-whole relationships and hierarchical data.",
    charts: [
      {
        name: "PieChart",
        desc: "Donut/pie chart with optional legend.",
        mount() {
          mountInto(
            PieChart.create({
              data: [
                { label: "Organic", value: 45 },
                { label: "Paid Ads", value: 25 },
                { label: "Social", value: 18 },
                { label: "Referral", value: 12 },
              ],
              donut: true,
              showLegend: "side",
            }),
            "demo-pie",
          );
        },
        code: `PieChart.create({
  data: [{ label:'Organic',value:45 }, { label:'Paid Ads',value:25 }, ...],
  donut: true, showLegend: 'side',
})`,
        demoId: "demo-pie",
      },
      {
        name: "Treemap",
        desc: "Hierarchical area chart with squarified layout.",
        mount() {
          mountInto(
            Treemap.create({
              data: {
                name: "Revenue",
                children: [
                  {
                    name: "US",
                    value: 500,
                    children: [
                      { name: "Enterprise", value: 300 },
                      { name: "SMB", value: 150 },
                      { name: "Consumer", value: 50 },
                    ],
                  },
                  {
                    name: "EU",
                    value: 300,
                    children: [
                      { name: "Enterprise", value: 180 },
                      { name: "SMB", value: 120 },
                    ],
                  },
                  { name: "APAC", value: 200 },
                ],
              },
              title: "Revenue by Region",
            }),
            "demo-treemap",
          );
        },
        code: `Treemap.create({
  data: { name:'Revenue', children: [
    { name:'US', value:500, children: [...] },
    { name:'EU', value:300, children: [...] },
    { name:'APAC', value:200 },
  ]},
})`,
        demoId: "demo-treemap",
      },
      {
        name: "WordCloud",
        desc: "Text frequency visualization with sized words.",
        mount() {
          mountInto(
            WordCloud.create({
              words: [
                { text: "analytics", weight: 20 },
                { text: "dashboard", weight: 18 },
                { text: "data", weight: 15 },
                { text: "charts", weight: 14 },
                { text: "reports", weight: 12 },
                { text: "metrics", weight: 10 },
                { text: "insights", weight: 9 },
                { text: "visualize", weight: 8 },
                { text: "trends", weight: 7 },
                { text: "KPI", weight: 6 },
              ],
              maxWords: 10,
            }),
            "demo-wordcloud",
          );
        },
        code: `WordCloud.create({
  words: [
    { text:'analytics',weight:20 },
    { text:'dashboard',weight:18 }, ...],
  maxWords: 10,
})`,
        demoId: "demo-wordcloud",
      },
    ],
  },
  {
    category: "Flow & Process",
    icon: "\u{1F30A}",
    desc: "Flow magnitude, conversion funnels, and cumulative effects.",
    charts: [
      {
        name: "FunnelChart",
        desc: "Conversion/loss funnel showing decreasing stages with drop rates.",
        mount() {
          mountInto(
            FunnelChart.create({
              data: [
                { stage: "Visitors", value: 10000 },
                { stage: "Sign Ups", value: 2500 },
                { stage: "Trials", value: 1200 },
                { stage: "Paid", value: 480 },
              ],
            }),
            "demo-funnel",
          );
        },
        code: `FunnelChart.create({
  data: [
    { stage:'Visitors', value:10000 },
    { stage:'Sign Ups', value:2500 },
    { stage:'Trials', value:1200 },
    { stage:'Paid', value:480 },
  ],
})`,
        demoId: "demo-funnel",
      },
      {
        name: "SankeyChart",
        desc: "Flow diagram showing magnitude between nodes.",
        mount() {
          mountInto(
            SankeyChart.create({
              nodes: [
                { id: "A", label: "Source A" },
                { id: "B", label: "Source B" },
                { id: "C", label: "Target X" },
                { id: "D", label: "Target Y" },
              ],
              links: [
                { source: "A", target: "C", value: 80 },
                { source: "A", target: "D", value: 20 },
                { source: "B", target: "C", value: 30 },
                { source: "B", target: "D", value: 70 },
              ],
              showValues: true,
            }),
            "demo-sankey",
          );
        },
        code: `SankeyChart.create({
  nodes: [{ id:'A',label:'Source A' }, { id:'B',label:'Source B' }, ...],
  links: [{ source:'A',target:'C',value:80 }, ...],
  showValues: true,
})`,
        demoId: "demo-sankey",
      },
      {
        name: "WaterfallChart",
        desc: "Cumulative positive/negative contributions toward a total.",
        mount() {
          mountInto(
            WaterfallChart.create({
              data: [
                { label: "Start", value: 1000 },
                { label: "Sales", value: 450 },
                { label: "Returns", value: -150 },
                { label: "Discounts", value: -80 },
                { label: "Upsells", value: 200 },
                { label: "Total", value: 1420, isTotal: true },
              ],
            }),
            "demo-waterfall",
          );
        },
        code: `WaterfallChart.create({
  data: [
    { label:'Start', value:1000 },
    { label:'Sales', value:450 },
    { label:'Returns', value:-150 },
    { label:'Total', value:1420, isTotal:true },
  ],
})`,
        demoId: "demo-waterfall",
      },
    ],
  },
  {
    category: "Distribution & Relation",
    icon: "\u{1F4CA}",
    desc: "Scatter, heatmaps, and network relationships.",
    charts: [
      {
        name: "ScatterPlot",
        desc: "XY correlation chart with optional bubble size.",
        mount() {
          mountInto(
            ScatterPlot.create({
              data: [
                { x: 12.5, y: 1.2, r: 8, label: "A" },
                { x: 9.8, y: 2.1, r: 6, label: "B" },
                { x: 15.0, y: 0.8, r: 10, label: "C" },
                { x: 11.0, y: 1.8, r: 7, label: "D" },
                { x: 8.2, y: 3.0, r: 5, label: "E" },
              ],
              xLabel: "CAR %",
              yLabel: "NPL %",
            }),
            "demo-scatter",
          );
        },
        code: `ScatterPlot.create({
  data: [
    { x:12.5, y:1.2, r:8, label:'A' },
    { x:9.8,  y:2.1, r:6, label:'B' }, ...],
  xLabel: 'CAR %', yLabel: 'NPL %',
})`,
        demoId: "demo-scatter",
      },
      {
        name: "Heatmap",
        desc: "Color-coded matrix for risk, correlation, or intensity.",
        mount() {
          mountInto(
            Heatmap.create({
              data: [
                [0.12, 0.05, 0.08, 0.03],
                [0.03, 0.01, 0.02, 0.06],
                [0.09, 0.15, 0.11, 0.04],
                [0.07, 0.03, 0.05, 0.01],
              ],
              rowLabels: ["Credit", "Market", "Operational", "Liquidity"],
              colLabels: ["Q1", "Q2", "Q3", "Q4"],
              colorScale: ["#15803d", "#ca8a04", "#b91c1c"],
            }),
            "demo-heatmap",
          );
        },
        code: `Heatmap.create({
  data: [[0.12,0.05,0.08,0.03], ...],
  rowLabels: ['Credit','Market','Operational','Liquidity'],
  colLabels: ['Q1','Q2','Q3','Q4'],
  colorScale: ['#15803d','#ca8a04','#b91c1c'],
})`,
        demoId: "demo-heatmap",
      },
      {
        name: "NetworkGraph",
        desc: "Node-edge graph for interconnections and relationships.",
        mount() {
          mountInto(
            NetworkGraph.create({
              nodes: [
                { id: "A", label: "Core", size: 22 },
                { id: "B", label: "Node B", size: 14 },
                { id: "C", label: "Node C", size: 16 },
                { id: "D", label: "Node D", size: 12 },
                { id: "E", label: "Node E", size: 10 },
              ],
              edges: [
                { from: "A", to: "B", weight: 0.9 },
                { from: "A", to: "C", weight: 0.7 },
                { from: "A", to: "D", weight: 0.5 },
                { from: "B", to: "C", weight: 0.4 },
                { from: "C", to: "E", weight: 0.6 },
              ],
              layout: "circular",
              title: "Network",
            }),
            "demo-network",
          );
        },
        code: `NetworkGraph.create({
  nodes: [{ id:'A',label:'Core',size:22 }, ...],
  edges: [{ from:'A',to:'B',weight:0.9 }, ...],
  layout: 'circular',
})`,
        demoId: "demo-network",
      },
    ],
  },
  {
    category: "Gauge & Combo",
    icon: "\u{1F3AF}",
    desc: "Single-value gauges and multi-type combination charts.",
    charts: [
      {
        name: "GaugeChart",
        desc: "Semi-circle gauge with colored arcs and needle.",
        mount() {
          mountInto(
            GaugeChart.create({
              value: 72,
              max: 100,
              label: "Performance",
              sub: "Good",
              leftLabel: "Low",
              rightLabel: "High",
              unit: "/100",
            }),
            "demo-gauge",
          );
        },
        code: `GaugeChart.create({
  value: 72, max: 100,
  label: 'Performance', sub: 'Good',
  leftLabel: 'Low', rightLabel: 'High',
})`,
        demoId: "demo-gauge",
      },
      {
        name: "ComboChart",
        desc: "Stacked bar chart + line overlay with dual-axis.",
        mount() {
          mountInto(
            ComboChart.create({
              sectors: [
                { key: "product", name: "Product Sales", color: "#646cff" },
                { key: "service", name: "Service Revenue", color: "#40c057" },
              ],
              quarters: [
                { label: "Q1", product: 30, service: 20 },
                { label: "Q2", product: 42, service: 25 },
                { label: "Q3", product: 35, service: 28 },
                { label: "Q4", product: 50, service: 32 },
              ],
              line: [
                { value: 45 },
                { value: 52 },
                { value: 48 },
                { value: 65 },
              ],
              lineColor: "#fa5252",
              lineLabel: "Total Revenue",
              title: "Revenue Breakdown",
            }),
            "demo-combo",
          );
        },
        code: `ComboChart.create({
  sectors: [{ key:'product',name:'Product Sales',color:'#646cff' }, ...],
  quarters: [{ label:'Q1',product:30,service:20 }, ...],
  line: [{ value:45 }, { value:52 }, ...], lineColor: '#fa5252',
  lineLabel: 'Total Revenue',
})`,
        demoId: "demo-combo",
      },
    ],
  },
  {
    category: "Distribution & Statistics",
    icon: "\u{1F4C8}",
    desc: "Histograms, box plots, and statistical distributions.",
    charts: [
      {
        name: "Histogram",
        desc: "Distribution histogram with auto-binning.",
        mount() { mountInto(Histogram.create({ data: [12,15,18,20,22,22,25,28,30,32,35,38,40,42,45,48,50,55,60,65], bins: 8 }), "demo-histogram") },
        code: "Histogram.create({\n  data: [12,15,18,20,22,...], bins: 8,\n})",
        demoId: "demo-histogram",
      },
      {
        name: "BoxPlot",
        desc: "Statistical box-and-whisker plot.",
        mount() { mountInto(BoxPlot.create({ data: [{ label:"A",min:10,q1:20,median:28,q3:35,max:50 },{ label:"B",min:15,q1:25,median:32,q3:40,max:55 }] }), "demo-boxplot") },
        code: "BoxPlot.create({\n  data: [{ label:'A',min:10,q1:20,median:28,q3:35,max:50 }, ...],\n})",
        demoId: "demo-boxplot",
      },
    ],
  },
  {
    category: "Hierarchical",
    icon: "\u{1F4CA}",
    desc: "Sunburst, treemap — multi-level hierarchy.",
    charts: [
      {
        name: "Sunburst",
        desc: "Multi-level hierarchical donut chart.",
        mount() { mountInto(Sunburst.create({ data: { name:"Root", children: [{ name:"A",value:100,children:[{name:"A1",value:60},{name:"A2",value:40}] },{ name:"B",value:80 }] } }), "demo-sunburst") },
        code: "Sunburst.create({\n  data: { name:'Root', children: [...] },\n})",
        demoId: "demo-sunburst",
      },
    ],
  },
  {
    category: "Specialized",
    icon: "\u{1F3AF}",
    desc: "Dual-axes, rose, and radial bar charts.",
    charts: [
      {
        name: "DualAxesChart",
        desc: "Dual Y-axis: bars + line overlay.",
        mount() { mountInto(DualAxesChart.create({ bars: [{label:"Jan",value:30},{label:"Feb",value:42},{label:"Mar",value:35},{label:"Apr",value:50}], line: [{value:45},{value:52},{value:48},{value:65}], leftLabel:"Sales",rightLabel:"Revenue" }), "demo-dualaxes") },
        code: "DualAxesChart.create({\n  bars: [{ label:'Jan',value:30 }, ...],\n  line: [{ value:45 }, ...],\n  leftLabel: 'Sales', rightLabel: 'Revenue',\n})",
        demoId: "demo-dualaxes",
      },
      {
        name: "RoseChart",
        desc: "Nightingale rose / polar area chart.",
        mount() { mountInto(RoseChart.create({ data: [{label:"A",value:85},{label:"B",value:60},{label:"C",value:45},{label:"D",value:70},{label:"E",value:55},{label:"F",value:40}] }), "demo-rose") },
        code: "RoseChart.create({\n  data: [{ label:'A',value:85 }, ...],\n})",
        demoId: "demo-rose",
      },
      {
        name: "RadialBarChart",
        desc: "Circular bar chart radiating from center.",
        mount() { mountInto(RadialBarChart.create({ data: [{label:"Speed",value:90},{label:"Power",value:75},{label:"Range",value:60},{label:"Safety",value:85},{label:"Comfort",value:70}], max:100 }), "demo-radialbar") },
        code: "RadialBarChart.create({\n  data: [{ label:'Speed',value:90 }, ...],\n  max: 100,\n})",
        demoId: "demo-radialbar",
      },
    ],
  },
];

// ── Render Sidebar ───────────────────────────────────────────

function renderSidebar(activeChartId) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  let html = '<a class="back-link" href="/">\u2190 Back to Home</a>';
  html += "<h2>\u{1F4CA} Chart Types</h2>";

  for (const cat of catalog) {
    html += `<div class="cat-label">${cat.icon} ${cat.category}</div>`;
    for (const chart of cat.charts) {
      const id = chart.demoId;
      const active = id === activeChartId ? ' class="active"' : "";
      html += `<button${active} data-id="${id}">${chart.name}</button>`;
    }
  }

  sidebar.innerHTML = html;
}

// ── Render Main Content ──────────────────────────────────────

function renderMain(chartInfo) {
  const main = document.getElementById("main");
  if (!main) return;

  main.innerHTML = `
    <h1>${chartInfo.name}</h1>
    <p class="desc">${chartInfo.desc}</p>
    <p class="meta">Category: ${findCategory(chartInfo.demoId)} | 19 chart types total</p>
    <div class="demo-area" id="${chartInfo.demoId}" style="min-height:280px;"></div>
    <div class="code-block"><span style="color:#6c7086;">// ${chartInfo.name} usage</span>
${escHtml(chartInfo.code)}</div>
  `;
  // Mount chart after DOM update
  setTimeout(() => chartInfo.mount(), 30);
}

function findCategory(demoId) {
  for (const cat of catalog) {
    if (cat.charts.some((c) => c.demoId === demoId)) return cat.category;
  }
  return "";
}

function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

// ── Init ─────────────────────────────────────────────────────

let activeChart = catalog[0].charts[0];

renderSidebar(activeChart.demoId);
renderMain(activeChart);

// Click handler
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;

  const id = btn.dataset.id;
  for (const cat of catalog) {
    const chart = cat.charts.find((c) => c.demoId === id);
    if (chart) {
      activeChart = chart;
      renderSidebar(id);
      renderMain(chart);
      return;
    }
  }
});
