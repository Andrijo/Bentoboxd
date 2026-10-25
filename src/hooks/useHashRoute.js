import { useState, useEffect, useCallback } from "react"

/** Páginas con hash propio; cualquier otro hash es el perfil. */
const PAGES = ["quiz", "higher-lower"]

function readPage() {
  const hash = window.location.hash.slice(1)
  return PAGES.includes(hash) ? hash : "profile"
}

/**
 * Navegación mínima basada en el hash de la URL, para que el botón
 * atrás del navegador funcione y las páginas se puedan enlazar.
 */
export function useHashRoute() {
  const [page, setPage] = useState(readPage)

  useEffect(() => {
    const sync = () => setPage(readPage())
    window.addEventListener("popstate", sync)
    window.addEventListener("hashchange", sync)
    return () => {
      window.removeEventListener("popstate", sync)
      window.removeEventListener("hashchange", sync)
    }
  }, [])

  const navigate = useCallback((next) => {
    if (next === readPage()) return
    const { pathname, search } = window.location
    window.history.pushState(
      null,
      "",
      next === "profile" ? pathname + search : `#${next}`,
    )
    setPage(next)
    window.scrollTo(0, 0)
  }, [])

  return [page, navigate]
}
