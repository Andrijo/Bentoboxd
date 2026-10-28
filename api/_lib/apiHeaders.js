// Las respuestas de la API son datos, nunca páginas: si alguien abre una URL
// de /api/* directamente, el navegador no ejecuta ni incrusta nada.
const API_CSP = "default-src 'none'; frame-ancestors 'none'; sandbox"

export function setApiSecurityHeaders(res) {
  res.setHeader("Content-Security-Policy", API_CSP)
  res.setHeader("X-Content-Type-Options", "nosniff")
}

/** Responde 429 con Retry-After si el limitador lo indica; devuelve si cortó. */
export function rejectIfRateLimited(res, { limited, retryAfter }) {
  if (!limited) return false
  res.setHeader("Retry-After", String(retryAfter))
  res.setHeader("Cache-Control", "no-store")
  res.status(429).json({ error: "Demasiadas peticiones. Inténtalo en un minuto." })
  return true
}
