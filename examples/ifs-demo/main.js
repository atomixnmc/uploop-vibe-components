// ─── IFS Demo — Generative HyperGraph Loop ──────────────────

import { html, component } from "@uploop/html";
import { inject } from "@uploop/css";
import {
  vibeLight,
  applyVibeTheme,
  injectVibeAnimations,
} from "@uploop-vibe/vibe";
import {
  runIFSLoop,
  validateVibeIntent,
  auditManifest,
  diff,
  createLoopGuard,
  ErrorCodes,
  resolveSeedToManifest,
} from "@uploop-vibe/vibe-ai";

applyVibeTheme(vibeLight);
injectVibeAnimations();
inject();

// ── Seed presets ─────────────────────────────────────────────

const presets = [
  {
    name: "User Management",
    icon: "👥",
    seed: {
      goal: "data-management",
      entity: {
        name: "User",
        fields: [
          { name: "name", type: "string", display: "primary" },
          { name: "email", type: "email", display: "primary" },
          {
            name: "role",
            type: "enum",
            values: ["admin", "editor", "viewer"],
            display: "filterable",
          },
          {
            name: "status",
            type: "enum",
            values: ["active", "inactive"],
            display: "badge",
          },
        ],
      },
      actions: ["search", "create", "edit", "delete", "export"],
    },
  },
  {
    name: "Product Dashboard",
    icon: "📊",
    seed: {
      goal: "dashboard",
      entity: {
        name: "Product",
        fields: [
          { name: "revenue", type: "number" },
          { name: "orders", type: "number" },
          { name: "views", type: "number" },
          { name: "conversion", type: "number" },
        ],
      },
      actions: ["search"],
    },
  },
  {
    name: "Contact Form",
    icon: "📝",
    seed: {
      goal: "form",
      entity: {
        name: "Contact",
        fields: [
          { name: "name", type: "string" },
          { name: "email", type: "email" },
          {
            name: "subject",
            type: "enum",
            values: ["support", "sales", "other"],
          },
          { name: "message", type: "textarea" },
        ],
      },
      actions: [],
    },
  },
];

// ── Build sidebar HTML ──────────────────────────────────────

function buildSidebar(state, send) {
  let h = "";
  presets.forEach(function (p, i) {
    var active = state.selectedPreset === i;
    h +=
      '<button onclick="window.__ifsSelect(' +
      i +
      ')" style="padding:0.6rem 1rem;border:2px solid ' +
      (active ? "#646cff" : "#e8e8ed") +
      ";border-radius:10px;background:" +
      (active ? "#f0f4ff" : "white") +
      ';cursor:pointer;text-align:left;margin-right:0.5rem;margin-bottom:0.5rem;">';
    h += '<div style="font-size:1.2rem;">' + p.icon + "</div>";
    h += '<div style="font-weight:600;font-size:0.82rem;">' + p.name + "</div>";
    h += "</button>";
  });
  return h;
}

function buildScoreHistory(iterations) {
  if (!iterations.length) return "";
  var h =
    '<div style="background:white;border:1px solid #e8e8ed;border-radius:12px;padding:1rem;margin-bottom:1rem;">';
  h +=
    '<div style="font-size:0.72rem;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.5rem;">📈 Score History</div>';
  h +=
    '<div style="display:flex;align-items:flex-end;gap:0.5rem;height:80px;padding:0 0.5rem;">';
  iterations.forEach(function (iter, i) {
    var score = iter.audit?.score || 0;
    var height = Math.max(4, score);
    var color =
      score >= 90
        ? "#40c057"
        : score >= 75
          ? "#fab005"
          : score >= 60
            ? "#fd7e14"
            : "#fa5252";
    h +=
      '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:0.15rem;">';
    h += '<span style="font-size:0.6rem;color:#888;">' + score + "</span>";
    h +=
      '<div style="width:100%;height:' +
      height +
      "%;background:" +
      color +
      ';border-radius:4px 4px 0 0;"></div>';
    h += '<span style="font-size:0.55rem;color:#aaa;">G' + i + "</span>";
    h += "</div>";
  });
  h += "</div></div>";
  return h;
}

function buildIterationCards(iterations) {
  var h = "";
  iterations.forEach(function (iter, i) {
    var isLast = i === iterations.length - 1;
    var score = iter.audit?.score || 0;
    var grade = iter.audit?.grade || "-";
    var scoreColor =
      score >= 85 ? "#40c057" : score >= 70 ? "#fab005" : "#fa5252";

    h +=
      '<div style="background:white;border:1px solid ' +
      (isLast ? "#646cff" : "#e8e8ed") +
      ';border-radius:12px;padding:1rem;margin-bottom:0.75rem;">';
    h +=
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">';
    h += '<div style="display:flex;align-items:center;gap:0.5rem;">';
    h +=
      '<span style="font-weight:700;font-size:0.85rem;">' +
      (i === 0 ? "🌱 G₀ (Seed)" : "🔄 G" + i) +
      "</span>";
    h +=
      '<span style="font-size:0.8rem;color:' +
      scoreColor +
      ';font-weight:600;">Score: ' +
      score +
      " (" +
      grade +
      ")</span>";
    h += "</div>";
    h += '<div style="display:flex;gap:0.5rem;font-size:0.7rem;color:#888;">';
    h += "<span>" + (iter.manifest?.nodes || []).length + " nodes</span>";
    h += "<span>" + (iter.manifest?.edges || []).length + " edges</span>";
    h += "</div></div>";

    if (i > 0 && iter.transforms?.length > 0) {
      h +=
        '<div style="font-size:0.72rem;color:#888;margin-bottom:0.35rem;">Applied ' +
        iter.transforms.length +
        " transform(s): ";
      iter.transforms.forEach(function (t) {
        h +=
          '<code style="background:#f0f4ff;padding:0.1rem 0.3rem;border-radius:3px;">' +
          t.op +
          ": " +
          (t.path || t.state || t.behavior || "") +
          "</code> ";
      });
      h += "</div>";
    }

    if (iter.diff) {
      h += '<div style="font-size:0.72rem;margin-bottom:0.35rem;">';
      if (iter.diff.added?.length)
        h +=
          '<span style="color:#40c057;">+' +
          iter.diff.added.length +
          " added</span> ";
      if (iter.diff.removed?.length)
        h +=
          '<span style="color:#fa5252;">-' +
          iter.diff.removed.length +
          " removed</span> ";
      if (iter.diff.changed?.length)
        h +=
          '<span style="color:#fab005;">~' +
          iter.diff.changed.length +
          " changed</span> ";
      h += "</div>";
    }

    var issues = iter.audit?.issues;
    if (issues && issues.length > 0) {
      h += '<div style="margin-top:0.35rem;">';
      issues.slice(0, 3).forEach(function (issue) {
        h +=
          '<div style="font-size:0.7rem;color:#e67700;padding:0.15rem 0;">⚠ ' +
          (issue.warning?.message || issue.message) +
          "</div>";
      });
      h += "</div>";
    }
    h += "</div>";
  });
  return h;
}

// ── IFS Demo App ────────────────────────────────────────────

const IFSDemo = component("IFSDemo", {
  state: {
    selectedPreset: 0,
    iterations: [],
    running: false,
    converged: false,
    scoreThreshold: 85,
    maxIterations: 5,
  },

  update: {
    selectPreset: function (s, idx) {
      return {
        ...s,
        selectedPreset: Number(idx),
        iterations: [],
        converged: false,
      };
    },
    setIterations: function (s, iterations) {
      return { ...s, iterations };
    },
    setRunning: function (s, running) {
      return { ...s, running };
    },
    setConverged: function (s, converged) {
      return { ...s, converged };
    },
    setThreshold: function (s, v) {
      return { ...s, scoreThreshold: Number(v) };
    },
    setMaxIterations: function (s, v) {
      return { ...s, maxIterations: Number(v) };
    },
    runLoop: async function (s) {
      if (s.running) return s;
      var self = this;
      var state = { ...s, iterations: [], running: true, converged: false };
      setTimeout(async function () {
        var preset = presets[state.selectedPreset];
        var seed = preset.seed;
        var currentState = state;

        // Resolve seed
        var resolved = resolveSeedToManifest(seed);
        var manifest = resolved.manifest;
        var audit0 = auditManifest(manifest);
        manifest._auditScore = audit0.score;

        // Run IFS loop
        var result = await runIFSLoop(seed, {
          maxIterations: currentState.maxIterations,
          scoreThreshold: currentState.scoreThreshold,
          onIteration: function (iteration, m, audit, transforms) {
            var prevManifest =
              currentState.iterations.length > 0
                ? currentState.iterations[currentState.iterations.length - 1]
                    .manifest
                : manifest;
            var delta = iteration > 0 ? diff(prevManifest, m) : null;
            currentState.iterations = [
              ...currentState.iterations,
              {
                iteration: iteration,
                manifest: JSON.parse(JSON.stringify(m)),
                audit: JSON.parse(JSON.stringify(audit)),
                transforms: [...(transforms || [])],
                diff: delta,
              },
            ];
          },
        });

        IFSDemo.loop.send("setIterations", currentState.iterations);
        IFSDemo.loop.send("setRunning", false);
        IFSDemo.loop.send("setConverged", result.success);
      }, 50);
      return state;
    },
  },

  mount: function (el) {
    var self = this;
    window.__ifsSelect = function (idx) {
      self.loop.send("selectPreset", idx);
    };
    setTimeout(function () {
      self.loop.send("runLoop");
    }, 100);
  },

  view: function (state) {
    var preset = presets[state.selectedPreset];
    var seed = preset.seed;

    var sidebar = buildSidebar(state);
    var scoreChart = buildScoreHistory(state.iterations);
    var cards = buildIterationCards(state.iterations);
    var latestIter = state.iterations[state.iterations.length - 1];

    var convergedHTML = "";
    if (state.converged) {
      convergedHTML =
        '<div style="text-align:center;padding:1.5rem;background:#f0fdf4;border:1px solid #d0f0d8;border-radius:12px;">';
      convergedHTML += '<div style="font-size:2rem;">✅</div>';
      convergedHTML +=
        '<div style="font-weight:700;font-size:1rem;margin:0.25rem 0;">Converged</div>';
      convergedHTML +=
        '<div style="font-size:0.8rem;color:#888;">' +
        (state.iterations.length - 1) +
        " iteration(s) · Final score: " +
        (latestIter?.audit?.score || 0) +
        " · Grade: " +
        (latestIter?.audit?.grade || "-") +
        "</div>";
      convergedHTML += "</div>";
    } else if (state.iterations.length >= state.maxIterations + 1) {
      var bestScore = Math.max.apply(
        null,
        state.iterations.map(function (i) {
          return i.audit?.score || 0;
        }),
      );
      convergedHTML =
        '<div style="text-align:center;padding:1.5rem;background:#fff3bf;border:1px solid #ffc078;border-radius:12px;">';
      convergedHTML += '<div style="font-size:2rem;">⚠️</div>';
      convergedHTML +=
        '<div style="font-weight:700;font-size:1rem;margin:0.25rem 0;">Max iterations reached</div>';
      convergedHTML +=
        '<div style="font-size:0.8rem;color:#888;">Best score: ' +
        bestScore +
        "</div>";
      convergedHTML += "</div>";
    }

    return (
      '<div style="max-width:960px;margin:0 auto;padding:1.5rem;">' +
      '<div style="text-align:center;margin-bottom:1.5rem;">' +
      '<a href="../" style="font-size:0.72rem;color:#aaa;text-decoration:none;">← Home</a>' +
      '<h1 style="font-size:1.6rem;font-weight:800;margin:0.25rem 0 0;">🌊 IFS Demo</h1>' +
      '<p style="font-size:0.85rem;color:#888;margin:0.25rem 0 0;">Generative HyperGraphs — seed → iterate → converge</p>' +
      "</div>" +
      '<div style="margin-bottom:1.25rem;">' +
      sidebar +
      "</div>" +
      '<div style="background:white;border:1px solid #e8e8ed;border-radius:12px;padding:1rem;margin-bottom:1rem;">' +
      '<div style="font-size:0.72rem;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.5rem;">🌱 Seed Intent</div>' +
      '<pre style="margin:0;font-size:0.75rem;font-family:monospace;color:#555;line-height:1.4;overflow-x:auto;">' +
      JSON.stringify(seed, null, 2) +
      "</pre>" +
      "</div>" +
      '<div style="display:flex;gap:0.75rem;align-items:center;margin-bottom:1rem;flex-wrap:wrap;">' +
      '<button onclick="window.__ifsRun()" ' +
      (state.running ? "disabled" : "") +
      ' style="padding:0.5rem 1.25rem;background:#646cff;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.82rem;">▶ Run IFS Loop</button>' +
      '<span style="font-size:0.78rem;color:#888;">Threshold: ' +
      state.scoreThreshold +
      " | Max: " +
      state.maxIterations +
      "</span>" +
      (state.converged
        ? '<span style="color:#40c057;font-weight:600;font-size:0.85rem;">✅ Converged after ' +
          (state.iterations.length - 1) +
          " iterations</span>"
        : state.iterations.length > 1
          ? '<span style="color:#888;font-size:0.85rem;">Running... iteration ' +
            state.iterations.length +
            "</span>"
          : "") +
      "</div>" +
      scoreChart +
      cards +
      convergedHTML +
      "</div>"
    );
  },
});

IFSDemo.mount(document.getElementById("app"));

// Global handler for Run button
window.__ifsRun = function () {
  IFSDemo.loop.send("runLoop");
};
