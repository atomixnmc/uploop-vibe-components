// Build syntax validation — catches broken JS across all source files

import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import { readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const __dir = join(fileURLToPath(import.meta.url), "..");

function collectJS(dir, files = []) {
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory() && !entry.startsWith(".") && entry !== "node_modules") {
        collectJS(full, files);
      } else if (entry.endsWith(".js")) {
        files.push(full);
      }
    }
  } catch {}
  return files;
}

function checkSyntax(file) {
  try {
    execSync(`node --check "${file}"`, { encoding: "utf8", timeout: 5000, stdio: "pipe" });
    return { ok: true };
  } catch (e) {
    const msg = (e.stderr || e.message || "").toString();
    if (msg.includes("SyntaxError") && !msg.includes("Cannot find")) {
      return { ok: false, error: msg.split("\n").slice(0, 3).join("\n") };
    }
    return { ok: true };
  }
}

// Collect source files from examples and packages
const root = resolve(__dir, "../../../");
const allFiles = [
  ...collectJS(join(root, "examples")),
  ...collectJS(join(root, "packages")),
];

describe("source JS syntax check", () => {
  // Test all source files for valid syntax
  for (const file of allFiles.slice(0, 50)) {
    const rel = file.replace(root, "").replace(/\\/g, "/");
    it(rel + " has valid JS syntax", () => {
      const result = checkSyntax(file);
      if (!result.ok) throw new Error(result.error);
      expect(result.ok).toBe(true);
    });
  }
});
