import { defineConfig } from "vitest/config"
import { loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import { buildTmdbUpstreamUrl } from "./api/_lib/tmdbUpstream.js"

const TMDB_PROXY_PREFIX = "/api/tmdb"

export default defineConfig(({ mode }) => {
  // Prefijo "" carga todas las variables, pero solo aquí (Node): no llegan al
  // cliente. La key de TMDB se queda en el servidor de desarrollo.
  const env = loadEnv(mode, process.cwd(), "")

  const toUpstream = (path) => {
    const url = new URL(path, "http://localhost")
    return buildTmdbUpstreamUrl(
      url.pathname.slice(TMDB_PROXY_PREFIX.length),
      url.searchParams,
      env.TMDB_API_KEY || "",
    )
  }

  // Corre antes que el proxy: rechaza con 400, como api/tmdb.js, lo que no
  // está permitido (si no, TMDB respondería 401 y parecería un error de key).
  const rejectDisallowedTmdb = {
    name: "reject-disallowed-tmdb",
    configureServer(server) {
      server.middlewares.use(TMDB_PROXY_PREFIX, (req, res, next) => {
        if (toUpstream(req.originalUrl)) return next()
        res.statusCode = 400
        res.setHeader("Content-Type", "application/json")
        res.end(JSON.stringify({ error: "Ruta o parámetros no permitidos" }))
      })
    },
  }

  return {
    plugins: [react(), rejectDisallowedTmdb],
    server: {
      proxy: {
        "/rss-proxy": {
          target: "https://letterboxd.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/rss-proxy/, ""),
        },
        // Imita a api/tmdb.js: misma validación y key añadida en el servidor.
        [TMDB_PROXY_PREFIX]: {
          target: "https://api.themoviedb.org",
          changeOrigin: true,
          rewrite: (path) => {
            const upstream = toUpstream(path)
            return upstream.pathname + upstream.search
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.js"],
      include: ["{src,api}/**/*.{test,spec}.{js,jsx}"],
    },
  }
})
