// Mismo formato que acepta el proxy (api/rss.js).
const USERNAME_RE = /^[A-Za-z0-9_-]{1,60}$/

export function isValidUsername(username) {
  return USERNAME_RE.test(username || "")
}

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

/** La URL solo si es https y su host pasa `isAllowedHost`; si no, null. */
function httpsUrlOn(value, isAllowedHost) {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && isAllowedHost(url.hostname) ? value : null
  } catch {
    return null
  }
}

/** Enlace del feed a una ficha de Letterboxd, o null si apunta a otro sitio. */
export function safeFilmLink(value) {
  return httpsUrlOn(value, (host) => host === "letterboxd.com")
}

/** Póster del CDN de Letterboxd (*.ltrbxd.com), o null. */
export function safePosterUrl(value) {
  return httpsUrlOn(value, (host) => host === "ltrbxd.com" || host.endsWith(".ltrbxd.com"))
}

export function extractPoster(description) {
  const match = description?.match(/<img[^>]+src="([^"]+)"/)
  return match ? safePosterUrl(match[1]) : null
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
