import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

// Limpieza explícita del DOM entre tests (RTL no auto-registra sin globals).
afterEach(() => {
  cleanup()
})
