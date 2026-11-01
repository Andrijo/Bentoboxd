import "@testing-library/jest-dom/vitest"
import { afterEach, beforeEach } from "vitest"
import { cleanup } from "@testing-library/react"

// Los tests de api/ corren en Node, sin DOM: ahí no hay idioma que fijar.
const i18n = typeof document === "undefined" ? null : await import("../i18n/index.js")

// jsdom simula un navegador en inglés; los textos esperados están en español.
beforeEach(() => {
  i18n?.setLanguage("es")
})

// Limpieza explícita del DOM entre tests (RTL no auto-registra sin globals).
afterEach(() => {
  cleanup()
})
