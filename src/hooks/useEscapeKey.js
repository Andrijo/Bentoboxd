import { useEffect } from "react"

/** Ejecuta `onEscape` al presionar Escape (para cerrar modales). */
export function useEscapeKey(onEscape) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onEscape()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onEscape])
}
