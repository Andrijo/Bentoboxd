// Límite de peticiones por IP en memoria (ventana fija).
// Cada instancia de la función lleva su propia cuenta, así que es una barrera
// básica contra abusos, no un límite exacto: para eso está el firewall de Vercel.

const MAX_TRACKED_IPS = 5000

/** IP del cliente según las cabeceras que fija el edge de Vercel. */
export function clientIp(req) {
  const headers = req?.headers || {}
  const real = headers["x-real-ip"]
  if (typeof real === "string" && real) return real
  const forwarded = headers["x-forwarded-for"]
  return typeof forwarded === "string" ? forwarded.split(",")[0].trim() || null : null
}

/**
 * Devuelve una función `(req, now?) => { limited, retryAfter }`.
 * Sin IP identificable no se limita (p. ej. en tests o en local).
 */
export function createRateLimiter({ limit, windowMs }) {
  const hits = new Map()

  const prune = (now) => {
    for (const [ip, entry] of hits) {
      if (now >= entry.resetAt) hits.delete(ip)
    }
  }

  return function check(req, now = Date.now()) {
    const ip = clientIp(req)
    if (!ip) return { limited: false, retryAfter: 0 }

    const entry = hits.get(ip)
    if (!entry || now >= entry.resetAt) {
      if (hits.size >= MAX_TRACKED_IPS) prune(now)
      hits.set(ip, { count: 1, resetAt: now + windowMs })
      return { limited: false, retryAfter: 0 }
    }

    entry.count += 1
    return {
      limited: entry.count > limit,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    }
  }
}
