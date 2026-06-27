import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploopRoot = path.resolve(__dirname, "../uploopjs/packages");
const vibeRoot = path.resolve(__dirname, "packages");

export default defineConfig({
  root: "examples",
  server: {
    port: 3100,
    open: true,
  },
  resolve: {
    conditions: ["import"],
    alias: {
      "@uploop/core": path.join(uploopRoot, "core/src/index.js"),
      "@uploop/html": path.join(uploopRoot, "html/src/index.js"),
      "@uploop/css": path.join(uploopRoot, "css/src/index.js"),
      "@uploop/store": path.join(uploopRoot, "store/src/index.js"),
      "@uploop/schema": path.join(uploopRoot, "schema/src/index.js"),
      "@uploop/flows": path.join(uploopRoot, "flows/src/index.js"),
      "@uploop-vibe/vibe": path.join(vibeRoot, "vibe/src/index.js"),
      "@uploop-vibe/vibe-ai": path.join(vibeRoot, "vibe-ai/src/index.js"),
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
