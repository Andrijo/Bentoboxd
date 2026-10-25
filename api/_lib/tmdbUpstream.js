// Construye la URL real de TMDB a partir de una ruta y parámetros del cliente.
// La comparten el proxy de producción (api/tmdb.js) y el de desarrollo
// (vite.config.js), para que ambos acepten exactamente lo mismo.
//
// Solo se permiten las rutas y parámetros que usa la app: así la key no puede
// usarse para consultar cualquier endpoint de TMDB.

const TMDB_ORIGIN = "https://api.themoviedb.org"
const LANGUAGE_RE = /^[a-z]{2}(-[A-Z]{2})?$/
const YEAR_RE = /^\d{4}$/
const APPEND_VALUES = new Set(["credits", "watch/providers"])
const MAX_QUERY_LENGTH = 200

const isLanguage = (value) => LANGUAGE_RE.test(value)

const ROUTES = [
  {
    pattern: /^search\/movie$/,
    params: {
      query: (value) => value.length > 0 && value.length <= MAX_QUERY_LENGTH,
      year: (value) => YEAR_RE.test(value),
      language: isLanguage,
    },
    required: ["query"],
  },
  {
    pattern: /^movie\/\d{1,10}$/,
    params: {
      append_to_response: (value) =>
        value.split(",").every((part) => APPEND_VALUES.has(part)),
      language: isLanguage,
    },
    required: [],
  },
]

/**
 * Devuelve la URL de TMDB con la key añadida, o null si la ruta o algún
 * parámetro no está permitido.
 *
 * @param {string} path Ruta relativa a /3/, p. ej. "search/movie".
 * @param {URLSearchParams} searchParams Parámetros enviados por el cliente.
 * @param {string} apiKey Key de TMDB (solo en el servidor).
 */
export function buildTmdbUpstreamUrl(path, searchParams, apiKey) {
  const cleanPath = String(path || "").replace(/^\/+|\/+$/g, "")
  const route = ROUTES.find((r) => r.pattern.test(cleanPath))
  if (!route) return null

  const upstream = new URL(`/3/${cleanPath}`, TMDB_ORIGIN)

  for (const [name, value] of searchParams) {
    const validate = route.params[name]
    if (!validate || !validate(value)) return null
    upstream.searchParams.set(name, value)
  }

  if (route.required.some((name) => !upstream.searchParams.get(name))) {
    return null
  }

  upstream.searchParams.set("api_key", apiKey)
  return upstream
}
