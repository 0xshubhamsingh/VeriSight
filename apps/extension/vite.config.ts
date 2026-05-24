import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const contentEntry = fileURLToPath(new URL("./src/content.tsx", import.meta.url));

export default defineConfig({
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    target: "es2022",
    lib: {
      entry: contentEntry,
      name: "VeriSightContent",
      formats: ["iife"],
      fileName: () => "content.js",
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
});
