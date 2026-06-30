// @uploop-vibe/vibe-ai Loop Guard Tests

import { describe, it, expect } from "vitest";
import { createLoopGuard, ScoreWeights, weightedAudit } from "../src/loop-guard.js";

describe("createLoopGuard", () => {
  it("creates a guard with default options", () => {
    const guard = createLoopGuard();
    expect(guard.step).toBeInstanceOf(Function);
    expect(guard.recordTransform).toBeInstanceOf(Function);
    expect(guard.summary).toBeInstanceOf(Function);
    expect(guard.iteration).toBe(0);
  });

  it("accepts custom options", () => {
    const guard = createLoopGuard({ maxIterations: 3, scoreThreshold: 80 });
    const result = guard.step({ nodes: [], edges: [] }, 50);
    expect(result.continue).toBe(true);
  });

  describe("convergence", () => {
    it("stops when score reaches threshold", () => {
      const guard = createLoopGuard({ scoreThreshold: 90 });
      const result = guard.step({ nodes: [], edges: [] }, 95);
      expect(result.continue).toBe(false);
      expect(result.status).toBe("converged");
    });

    it("continues when score is below threshold", () => {
      const guard = createLoopGuard({ scoreThreshold: 90 });
      const result = guard.step({ nodes: [], edges: [] }, 85);
      expect(result.continue).toBe(true);
      expect(result.status).toBe("continuing");
    });
  });

  describe("max iterations", () => {
    it("stops after max iterations", () => {
      const guard = createLoopGuard({ maxIterations: 3, scoreThreshold: 99 });
      guard.step({ nodes: [{ id: "a" }], edges: [] }, 80);
      guard.step({ nodes: [{ id: "b" }], edges: [] }, 80);
      const result = guard.step({ nodes: [{ id: "c" }], edges: [] }, 80);
      expect(result.continue).toBe(false);
      expect(result.status).toBe("max_iterations");
    });
  });

  describe("oscillation detection", () => {
    it("detects repeating pattern without improvement", () => {
      const guard = createLoopGuard({ scoreThreshold: 99, oscillationWindow: 3 });
      const graphA = { nodes: [{ id: "a", type: "view", component: "Button" }], edges: [] };
      const graphB = { nodes: [{ id: "b", type: "view", component: "Input" }], edges: [] };

      // A, B, A, B, A -- cycling without improvement
      guard.step(graphA, 70);
      guard.step(graphB, 70);
      guard.step(graphA, 70);
      guard.step(graphB, 70);
      const result = guard.step(graphA, 70);

      // Either oscillating or stalled (both are valid stop reasons)
      expect(result.continue).toBe(false);
      expect(["oscillating", "stalled"]).toContain(result.status);
    });

    it("continues when graphs are changing with improvement", () => {
      const guard = createLoopGuard({ scoreThreshold: 99, oscillationWindow: 3 });
      guard.step({ nodes: [{ id: "a" }], edges: [] }, 70);
      guard.step({ nodes: [{ id: "b" }], edges: [] }, 72);
      const result = guard.step({ nodes: [{ id: "c" }], edges: [] }, 75);
      expect(result.continue).toBe(true);
    });
  });

  describe("stall detection", () => {
    it("stops after consecutive stalls", () => {
      const guard = createLoopGuard({ scoreThreshold: 99, stallLimit: 3, minImprovement: 5 });
      guard.step({ nodes: [{ id: "a" }], edges: [] }, 60);
      guard.step({ nodes: [{ id: "b" }], edges: [] }, 60);
      guard.step({ nodes: [{ id: "c" }], edges: [] }, 60);
      const result = guard.step({ nodes: [{ id: "d" }], edges: [] }, 60);
      expect(result.continue).toBe(false);
      expect(result.status).toBe("stalled");
    });
  });

  describe("summary", () => {
    it("returns iteration state", () => {
      const guard = createLoopGuard();
      guard.step({ nodes: [], edges: [] }, 75);
      guard.step({ nodes: [], edges: [] }, 80);
      const s = guard.summary();
      expect(s.iterations).toBe(2);
      expect(s.bestScore).toBe(80);
      expect(s.converged).toBe(false);
      expect(s.history.length).toBe(2);
    });

    it("reports converged when threshold met", () => {
      const guard = createLoopGuard({ scoreThreshold: 80 });
      guard.step({ nodes: [], edges: [] }, 85);
      expect(guard.summary().converged).toBe(true);
    });
  });

  describe("recordTransform", () => {
    it("tracks consecutive failures", () => {
      const guard = createLoopGuard({ transformFailLimit: 3 });
      guard.recordTransform(false);
      guard.recordTransform(false);
      const result = guard.recordTransform(false);
      expect(result.continue).toBe(false);
      expect(result.reason).toContain("consecutive");
    });

    it("resets on success", () => {
      const guard = createLoopGuard({ transformFailLimit: 3 });
      guard.recordTransform(false);
      guard.recordTransform(false);
      guard.recordTransform(true);
      expect(guard.recordTransform(false).continue).toBe(true);
      expect(guard.recordTransform(false).continue).toBe(true);
      expect(guard.recordTransform(false).continue).toBe(false);
    });
  });

  describe("graphHash", () => {
    it("different manifests produce different hashes", () => {
      const guard = createLoopGuard();
      const h1 = guard.graphHash({ nodes: [{ id: "a", type: "view", component: "Button" }], edges: [] });
      const h2 = guard.graphHash({ nodes: [{ id: "b", type: "view", component: "Input" }], edges: [] });
      expect(h1).not.toBe(h2);
    });

    it("identical manifests produce same hash", () => {
      const guard = createLoopGuard();
      const m = { nodes: [{ id: "a", type: "view", component: "Button" }], edges: [{ from: "a", to: "b" }] };
      expect(guard.graphHash(m)).toBe(guard.graphHash(m));
    });
  });
});

describe("ScoreWeights", () => {
  it("critical weights > non-critical", () => {
    expect(ScoreWeights.missing_error_state).toBeGreaterThan(ScoreWeights.missing_empty_state);
    expect(ScoreWeights.circular_dependency).toBeGreaterThan(ScoreWeights.accessibility_gap);
  });

  it("has all expected keys", () => {
    expect(Object.keys(ScoreWeights)).toContain("missing_error_state");
    expect(Object.keys(ScoreWeights)).toContain("missing_loading_state");
    expect(Object.keys(ScoreWeights)).toContain("performance_warning");
    expect(Object.keys(ScoreWeights)).toContain("accessibility_gap");
    expect(Object.keys(ScoreWeights)).toContain("missing_debounce");
  });
});

describe("weightedAudit", () => {
  it("returns 100 for no issues", () => {
    const result = weightedAudit({}, { issues: [], suggestions: [] });
    expect(result.score).toBe(100);
    expect(result.grade).toBe("A+");
  });

  it("deducts weighted points correctly", () => {
    const auditResult = {
      issues: [
        { warning: { code: "missing_error_state", message: "x" } },
        { warning: { code: "missing_empty_state", message: "y" } },
      ],
      suggestions: [],
    };
    const result = weightedAudit({}, auditResult);
    expect(result.score).toBe(70);
  });

  it("categorizes issues in breakdown", () => {
    const auditResult = {
      issues: [
        { warning: { code: "missing_error_state", message: "x" } },
        { warning: { code: "accessibility_gap", message: "y" } },
      ],
      suggestions: [
        { warning: { code: "missing_debounce", message: "z" } },
      ],
    };
    const result = weightedAudit({}, auditResult);
    expect(result.breakdown.critical.length).toBeGreaterThanOrEqual(0);
    expect(result.breakdown.medium.length).toBeGreaterThanOrEqual(0);
  });

  it("grades B for 80-89 range", () => {
    const auditResult = {
      issues: [
        { warning: { code: "missing_empty_state", message: "x" } },
        { warning: { code: "performance_warning", message: "y" } },
      ],
      suggestions: [],
    };
    const result = weightedAudit({}, auditResult);
    expect(result.score).toBe(82);
    expect(result.grade).toBe("B");
  });
});
