import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * Read a Windows User- or Machine-level environment variable directly from the
 * registry. This is needed because `process.env` only captures the values that
 * were present when the current Node/pnpm process was launched.  If the user
 * sets (or changes) a Windows system environment variable AFTER the terminal
 * was opened, `process.env` will be stale — this function reads the current
 * registry value instead.
 *
 * Falls back to an empty string on non-Windows platforms or on any error.
 */
function readWindowsEnv(key: string): string {
  if (process.platform !== "win32") return "";
  try {
    // Query User env first, then Machine env. Uses PowerShell 5.1-compatible
    // syntax (no ?? null-coalescing operator, which requires PowerShell 7+).
    const ps =
      `$v=[Environment]::GetEnvironmentVariable('${key}','User');` +
      `if($v){$v}else{[Environment]::GetEnvironmentVariable('${key}','Machine')}`;
    return execSync(`powershell -NoProfile -Command "${ps}"`, {
      encoding: "utf8",
      timeout: 4000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

/** Resolve an env key: .env file → process.env → Windows registry */
function resolveEnv(env: Record<string, string>, key: string): string {
  return env[key] || process.env[key] || readWindowsEnv(key) || "";
}

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
    // Resolution order: .env file → process.env → Windows registry.
    define: {
      "import.meta.env.OPENAI_API_KEY": JSON.stringify(resolveEnv(env, "OPENAI_API_KEY")),
      "import.meta.env.ANTHROPIC_API_KEY": JSON.stringify(resolveEnv(env, "ANTHROPIC_API_KEY")),
      "import.meta.env.GEMINI_API_KEY": JSON.stringify(resolveEnv(env, "GEMINI_API_KEY")),
      "import.meta.env.GOOGLE_MAPS_API_KEY": JSON.stringify(resolveEnv(env, "GOOGLE_MAPS_API_KEY")),
    },
  };
});
