import { resolve } from "node:path";
import { defineConfig } from "vite";

// The panel is served by Home Assistant as a single ES module from the `www/`
// folder of the integration, at /shared_expenses_frontend/index.js.
export default defineConfig({
  build: {
    outDir: resolve(__dirname, "../www"),
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
});
