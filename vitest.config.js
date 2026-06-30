import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["packages/**/*.test.js"],
    globals: true,
  },
  resolve: {
    alias: {
      "@uploop/core": new URL("../uploopjs/packages/core/src/index.js", import.meta.url).pathname,
      "@uploop/html": new URL("../uploopjs/packages/html/src/index.js", import.meta.url).pathname,
      "@uploop/css": new URL("../uploopjs/packages/css/src/index.js", import.meta.url).pathname,
      "@uploop/schema": new URL("../uploopjs/packages/schema/src/index.js", import.meta.url).pathname,
      "@uploop/flows": new URL("../uploopjs/packages/flows/src/index.js", import.meta.url).pathname,
      "@uploop/store": new URL("../uploopjs/packages/store/src/index.js", import.meta.url).pathname,
      "@uploop-vibe/vibe": new URL("packages/vibe/src/index.js", import.meta.url).pathname,
    },
  },
});
