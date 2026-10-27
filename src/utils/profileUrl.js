import { isValidUsername } from "../services/letterboxd.js"

// El perfil va en el query (`?user=`) y la página en el hash (`#quiz`), así
// useHashRoute no necesita saber del usuario: ya conserva `search` al navegar.
const PARAM = "user"

/** Usuario de la URL actual, o null si no hay o no es válido. */
export function readProfileParam() {
  const user = new URLSearchParams(window.location.search).get(PARAM)
  return user && isValidUsername(user) ? user : null
}

/**
 * Pone (o quita, con null) el usuario en la URL sin tocar el hash.
 * Por defecto crea una entrada de historial para que "atrás" vuelva al perfil
 * anterior; no hace nada si la URL ya es esa.
 */
export function writeProfileParam(user, { replace = false } = {}) {
  const url = new URL(window.location.href)
  if (user) url.searchParams.set(PARAM, user)
  else url.searchParams.delete(PARAM)
  if (url.href === window.location.href) return

  const next = url.pathname + url.search + url.hash
  if (replace) window.history.replaceState(null, "", next)
  else window.history.pushState(null, "", next)
}
