// Proxy de producción para el RSS de Letterboxd.
// Vercel lo expone en /api/rss?user=<usuario>.
//
// El RSS de Letterboxd no envía cabeceras CORS, así que el navegador no puede
// leerlo directamente desde otro origen. Esta función hace de intermediaria.

const LETTERBOXD = "https://letterboxd.com"
const USERNAME_RE = /^[A-Za-z0-9_-]{1,60}$/
const CACHE_SECONDS = 300

export default async function handler(req, res) {
  // Permite consumirlo también desde otro dominio (p. ej. con VITE_RSS_PROXY_URL absoluto).
  res.setHeader("Access-Control-Allow-Origin", "*")

  if (req.method === "OPTIONS") {
    res.status(204).end()
    return
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Método no permitido" })
    return
  }

  const user = String(req.query?.user ?? "").trim()

  // Valida el usuario para no convertir el proxy en un open proxy (SSRF).
  if (!USERNAME_RE.test(user)) {
    res.status(400).json({ error: "Usuario de Letterboxd inválido" })
    return
  }

  try {
    const upstream = await fetch(`${LETTERBOXD}/${user}/rss/`, {
      headers: {
        Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
        "User-Agent": "letterboxd-bento (feed proxy)",
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!upstream.ok) {
      const notFound = upstream.status === 404
      res.status(notFound ? 404 : 502).json({
        error: notFound
          ? "Usuario no encontrado en Letterboxd"
          : "Letterboxd respondió con un error",
      })
      return
    }

    const xml = await upstream.text()

    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8")
    res.setHeader(
      "Cache-Control",
      `public, max-age=0, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=600`,
    )
    res.status(200).send(xml)
  } catch {
    res.status(502).json({ error: "No se pudo contactar con Letterboxd" })
  }
}
