import { useCallback, useState } from "react"

const STORAGE_KEY = "bentoboxd_theme:v1"
const THEME_COLORS = { dark: "#111111", light: "#f6f4ee" }

/** Tema inicial: el que fijó el script de index.html antes de pintar. */
function readTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark"
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme])
}

export function useTheme() {
  const [theme, setTheme] = useState(readTheme)

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light"
    applyTheme(next)
    setTheme(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Almacenamiento no disponible: el tema solo dura esta sesión.
    }
  }, [theme])

  return [theme, toggleTheme]
}
