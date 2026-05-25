import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
    alias: {
      "@mity-garden/domain": resolve(__dirname, "../../packages/domain/src"),
      "@mity-garden/i18n": resolve(__dirname, "../../packages/i18n/src"),
      "@mity-garden/canvas-engine": resolve(__dirname, "../../packages/canvas-engine/src"),
      "@mity-garden/asset-library": resolve(__dirname, "../../packages/asset-library/src"),
      "@mity-garden/persistence": resolve(__dirname, "../../packages/persistence/src"),
      "@mity-garden/shared-ui": resolve(__dirname, "../../packages/shared-ui/src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  base: process.env["VITE_BASE_URL"] ?? "/",
});
