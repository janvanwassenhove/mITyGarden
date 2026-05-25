import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  // loadEnv with empty prefix loads ALL .env / .env.local variables into `env`,
  // including non-VITE_ prefixed ones that Vite normally keeps server-side only.
  const env = loadEnv(mode, process.cwd(), "");

  return {
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
        "@mity-garden/maps": resolve(__dirname, "../../packages/maps/src"),
        "@mity-garden/llm": resolve(__dirname, "../../packages/llm/src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
    base: env["VITE_BASE_URL"] ?? "/",
    // Expose non-VITE_ prefixed variables explicitly so they are available as
    // import.meta.env.OPENAI_API_KEY etc. in the browser bundle.
    // Using loadEnv ensures .env.local values are read, not just system env vars.
    define: {
      "import.meta.env.OPENAI_API_KEY": JSON.stringify(env["OPENAI_API_KEY"] ?? ""),
      "import.meta.env.ANTHROPIC_API_KEY": JSON.stringify(env["ANTHROPIC_API_KEY"] ?? ""),
      "import.meta.env.GEMINI_API_KEY": JSON.stringify(env["GEMINI_API_KEY"] ?? ""),
      "import.meta.env.GOOGLE_MAPS_API_KEY": JSON.stringify(env["GOOGLE_MAPS_API_KEY"] ?? ""),
    },
  };
});
