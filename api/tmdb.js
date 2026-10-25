// Proxy de producción para la API de TMDB.
// Vercel lo expone en /api/tmdb/<ruta> gracias al rewrite de vercel.json
// (que lo convierte en /api/tmdb?path=<ruta>).
//
// La key vive solo en el servidor (TMDB_API_KEY), así que nunca llega al bundle.

import { buildTmdbUpstreamUrl } from "./_lib/tmdbUpstream.js"

const CACHE_SECONDS = 60 * 60 * 24
const NOT_FOUND_CACHE_SECONDS = 60 * 60

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método no permitido" })
    return
  }

  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    // El cliente trata el 401 como error de configuración de la key.
    res.status(401).json({ error: "TMDB_API_KEY no está configurada en el servidor" })
    return
  }

  const { path, ...rest } = req.query || {}
  const params = new URLSearchParams()
  for (const [name, value] of Object.entries(rest)) {
    // Un parámetro repetido llega como array: no se acepta.
    if (typeof value !== "string") {
      res.status(400).json({ error: "Parámetro inválido" })
      return
    }
    params.set(name, value)
  }

  const upstreamUrl = buildTmdbUpstreamUrl(
    Array.isArray(path) ? path.join("/") : path,
    params,
    apiKey,
  )

  if (!upstreamUrl) {
    res.status(400).json({ error: "Ruta o parámetros no permitidos" })
    return
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    })

    const body = await upstream.text()

    const retryAfter = upstream.headers.get("Retry-After")
    if (retryAfter) res.setHeader("Retry-After", retryAfter)

    if (upstream.ok) {
      res.setHeader(
        "Cache-Control",
        `public, max-age=0, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 7}`,
      )
    } else if (upstream.status === 404) {
      res.setHeader("Cache-Control", `public, max-age=0, s-maxage=${NOT_FOUND_CACHE_SECONDS}`)
    } else {
      res.setHeader("Cache-Control", "no-store")
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8")
    res.status(upstream.status).send(body)
  } catch {
    res.status(502).json({ error: "No se pudo contactar con TMDB" })
  }
}
