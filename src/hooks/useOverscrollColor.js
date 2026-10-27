import { useEffect } from "react"

/**
 * El rebote nativo del overscroll rellena el hueco con el color de fondo
 * de html, no con su degradado. Según la dirección del gesto marca qué
 * extremo puede asomar, para que index.css use el color de ese extremo
 * del degradado. Va por dirección y no por posición porque en páginas
 * más cortas que la pantalla se puede rebotar por ambos lados.
 */
export function useOverscrollColor() {
  useEffect(() => {
    const root = document.documentElement
    const setEdge = (edge) => {
      if (root.dataset.edge !== edge) root.dataset.edge = edge
    }

    const onWheel = (e) => {
      if (e.deltaY) setEdge(e.deltaY > 0 ? "bottom" : "top")
    }

    // En táctil, el dedo hacia abajo desplaza hacia arriba.
    let lastY = 0
    const onTouchStart = (e) => {
      lastY = e.touches[0].clientY
    }
    const onTouchMove = (e) => {
      const y = e.touches[0].clientY
      if (y !== lastY) setEdge(y > lastY ? "top" : "bottom")
      lastY = y
    }

    setEdge("top")
    window.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      delete root.dataset.edge
    }
  }, [])
}
