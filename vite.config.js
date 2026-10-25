import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/rss-proxy": {
        target: "https://letterboxd.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss-proxy/, ""),
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    env: { VITE_TMDB_API_KEY: "test-key" },
  },
})
