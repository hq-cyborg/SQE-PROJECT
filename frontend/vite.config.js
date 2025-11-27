import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const proxy_url =
    process.env.VITE_DEV_REMOTE === "remote"
      ? process.env.VITE_BACKEND_SERVER
      : "http://localhost:8888/";

  return defineConfig({
    plugins: [react()],

    // ⭐ Works for both Vite & Vitest
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: proxy_url,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // ⭐ Correct Vitest config
    test: {
      globals: true,
      environment: "jsdom",
      include: ["test/**/*.test.{js,jsx}"],

      // ⭐ Coverage enabled
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "json", "lcov"],
        reportsDirectory: "coverage",
      },
    },
  });
};
