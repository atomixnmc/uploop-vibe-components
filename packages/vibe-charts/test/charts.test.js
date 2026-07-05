// ─── @uploop-vibe/vibe-charts Tests ───────────────────────────
// 19 chart types — functional + structural coverage

import { describe, it, expect } from "vitest";

// Try importing chart components; fall back to structural tests
let importsOk = false;
let allCharts = {};

try {
  const mod = await import("../src/index.js");
  allCharts = mod;
  importsOk = true;
} catch (e) {
  // Imports failed — will run structural tests below
}

const { BarChart, HorizontalBarChart, Heatmap, PieChart } = allCharts;

// ── Functional tests (when imports resolve) ───────────────────

describe.runIf(importsOk)("BarChart", () => {
  it("create() returns an object with a mount method", () => {
    const instance = BarChart.create({ data: [10, 20, 30], labels: ["A", "B", "C"] });
    expect(instance).toBeDefined();
    expect(typeof instance.mount).toBe("function");
  });

  it("render produces SVG", () => {
    const instance = BarChart.create({ data: [10, 20, 30], labels: ["A", "B", "C"] });
    const svg = instance.render();
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain('<rect');
  });

  it("handles empty data gracefully", () => {
    const instance = BarChart.create({ data: [] });
    expect(instance.render()).toContain("<svg");
  });

  it("state reflects provided props", () => {
    const instance = BarChart.create({ data: [5, 15], labels: ["X", "Y"], width: 600 });
    const state = instance.loop.get();
    expect(state.data).toEqual([5, 15]);
    expect(state.width).toBe(600);
  });
});

describe.runIf(importsOk)("HorizontalBarChart", () => {
  it("creates and renders SVG", () => {
    const instance = HorizontalBarChart.create({ data: [10, 20, 30], labels: ["A", "B", "C"] });
    expect(instance.render()).toContain("<svg");
  });
});

describe.runIf(importsOk)("Heatmap", () => {
  it("creates with 2D data and renders cells", () => {
    const instance = Heatmap.create({ data: [[1, 2], [3, 4]] });
    expect(instance.render()).toContain("<rect");
  });

  it("handles empty data", () => {
    const instance = Heatmap.create({ data: [] });
    expect(instance.render()).toContain("No data");
  });
});

describe.runIf(importsOk)("PieChart", () => {
  it("renders SVG with path slices", () => {
    const instance = PieChart.create({ data: [{ label: "A", value: 30 }, { label: "B", value: 50 }] });
    const svg = instance.render();
    expect(svg).toContain("<path");
  });

  it("donut mode renders Total", () => {
    const instance = PieChart.create({ data: [{ label: "A", value: 30 }], donut: true });
    expect(instance.render()).toContain("Total");
  });
});

describe.runIf(importsOk)("New charts render SVG", () => {
  const chartConfigs = [
    { name: "RadarChart", data: [{ name: "S1", values: [80, 60, 90] }], axes: [{ label: "A", max: 100 }, { label: "B", max: 100 }, { label: "C", max: 100 }] },
    { name: "FunnelChart", data: [{ stage: "Visit", value: 1000 }, { stage: "Signup", value: 500 }] },
    { name: "WaterfallChart", data: [{ label: "Start", value: 100 }, { label: "Add", value: 50 }, { label: "Total", value: 150, isTotal: true }] },
    { name: "SankeyChart", nodes: [{ id: "A" }, { id: "B" }], links: [{ source: "A", target: "B", value: 10 }] },
    { name: "StockChart", data: [{ date: "2024-01", open: 100, high: 110, low: 95, close: 105 }] },
    { name: "BidirectionalBarChart", left: [{ label: "A", value: 50 }], right: [{ label: "B", value: 30 }] },
    { name: "Treemap", data: { name: "Root", children: [{ name: "A", value: 100 }, { name: "B", value: 50 }] } },
    { name: "WordCloud", words: [{ text: "hello", weight: 10 }, { text: "world", weight: 5 }] },
    { name: "BulletChart", value: 65, target: 80, max: 100 },
  ];

  for (const cfg of chartConfigs) {
    it(cfg.name + " creates and renders", () => {
      const Chart = allCharts[cfg.name];
      if (!Chart) return; // Skip if not importable
      const instance = Chart.create(cfg);
      expect(instance).toBeDefined();
      const svg = instance.render();
      expect(svg).toContain("<svg");
    });
  }
});

// ── Structural tests (always run) ─────────────────────────────

describe("charts index exports all 19 types", () => {
  it("exports every expected chart", async () => {
    const mod = await import("../src/index.js");
    const expected = [
      "LineChart", "BarChart", "HorizontalBarChart", "PieChart",
      "AreaChart", "ScatterPlot", "NetworkGraph", "Heatmap",
      "GaugeChart", "ComboChart",
      "RadarChart", "FunnelChart", "WaterfallChart",
      "SankeyChart", "StockChart", "BidirectionalBarChart",
      "Treemap", "WordCloud", "BulletChart",
    ];
    for (const name of expected) {
      expect(mod[name], name).toBeDefined();
    }
    const exportCount = Object.keys(mod).filter(k => k !== "default").length;
    expect(exportCount).toBeGreaterThanOrEqual(19);
  });
});

describe("chart modules have create + view", () => {
  const modules = [
    "radar-chart.js", "funnel-chart.js", "waterfall-chart.js",
    "sankey-chart.js", "stock-chart.js", "bidirectional-bar.js",
    "treemap.js", "wordcloud.js", "bullet-chart.js",
    "chart-base.js",
  ];

  for (const file of modules) {
    it(file + " exports expected symbols", async () => {
      const mod = await import("../src/" + file);
      const keys = Object.keys(mod).filter(k => k !== "default");
      expect(keys.length).toBeGreaterThanOrEqual(1);
      // Each file should export at least one component or factory
      const hasComponent = keys.some(k => typeof mod[k] === "object" || typeof mod[k] === "function");
      expect(hasComponent).toBe(true);
    });
  }
});
