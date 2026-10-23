/// <reference types="vitest/config" />
import { resolve } from "node:path";
import { defineConfig } from "vite";

// This project lives outside the integration on purpose: only its output ships.
// The integration serves the bundle as a single ES module: from its own `www/`
// at /shared_expenses_frontend/index.js, and from a copy it makes in the
// configuration's `www/`, at /local/shared_expenses/index.js, which Home
// Assistant serves before any integration has loaded (ADR-016).
export default defineConfig({
  build: {
    outDir: resolve(__dirname, "../custom_components/shared_expenses/www"),
    // `www/` is versioned and holds a .gitkeep: never wipe it.
    emptyOutDir: false,
    target: "esnext",
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      output: {
        // Home Assistant loads one module URL: keep everything in one file.
        inlineDynamicImports: true,
      },
    },
  },
  test: {
    projects: [
      // The pure helpers, in Node.
      { extends: true, test: { name: "unit", include: ["tests/*.test.ts"] } },
      // The panel laid out in Chromium at a phone's width (tests/layout/harness.ts).
      {
        extends: true,
        test: {
          name: "layout",
          include: ["tests/layout/*.test.ts"],
          browser: {
            enabled: true,
            provider: "playwright",
            headless: true,
            viewport: { width: 360, height: 780 },
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
