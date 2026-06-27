import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { resolve } from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploopRoot = path.resolve(__dirname, "../uploopjs/packages");
const vibeRoot = path.resolve(__dirname, "packages");
const examplesRoot = resolve(__dirname, "examples");

export default defineConfig(({ mode }) => ({
  root: "examples",
  base: process.env.BASE_URL || "/",
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
    rollupOptions: {
      input: {
        main: resolve(examplesRoot, "index.html"),
        showcase: resolve(examplesRoot, "showcase/index.html"),
        "vibe-ai": resolve(examplesRoot, "vibe-ai/index.html"),
        "ifs-demo": resolve(examplesRoot, "ifs-demo/index.html"),
      },
    },
  },
}));
