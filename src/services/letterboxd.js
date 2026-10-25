export function parseUsername(input) {
  const raw = (input || "").trim()
  const match = raw.match(/letterboxd\.com\/([^/]+)/)
  return match ? match[1] : raw.replace(/^@/, "")
}

/**
 * Construye la URL del feed RSS a través del proxy.
 *
 * - Sin proxy configurado usa el de desarrollo (`/rss-proxy`, ver vite.config.js).
 * - En producción define `VITE_RSS_PROXY_URL` (por defecto se pasa `?user=<usuario>`).
 *   Si la URL contiene `{user}`, se sustituye ahí (modo path-style).
 */
export function buildRssUrl(username, proxyBase = import.meta.env.VITE_RSS_PROXY_URL) {
  const user = encodeURIComponent(username)
  const base = (proxyBase || "").trim()

  if (!base) {
    // En dev usa el proxy de Vite; en producción, la función de Vercel incluida.
    return import.meta.env.PROD
      ? `/api/rss?user=${user}`
      : `/rss-proxy/${user}/rss/`
  }

  if (base.includes("{user}")) return base.replaceAll("{user}", user)

  const sep = base.includes("?") ? "&" : "?"
  return `${base.replace(/\/$/, "")}${sep}user=${user}`
}

export function extractPoster(description) {
  const match = description?.match(/<img[^>]+src="([^"]+)"/)
  return match ? match[1] : null
}

export function extractRating(description) {
  const match = description?.match(/Rated: ([★½]+)/)
  if (!match) return null
  const raw = match[1]
  const full = (raw.match(/★/g) || []).length
  const half = raw.includes("½") ? 0.5 : 0
  return full + half
}

export function extractTitle(description) {
  const match = description?.match(/<p><strong>([^<]+)<\/strong><br>/)
  return match ? match[1] : null
}
