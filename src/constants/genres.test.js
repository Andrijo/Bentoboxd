import { describe, it, expect } from "vitest"
import { GENRE_CONFIG, GENRE_KEYS, TMDB_GENRES } from "./genres.js"

describe("GENRE_CONFIG", () => {
  it("define color, glow e icono para cada género", () => {
    GENRE_KEYS.forEach((genre) => {
      expect(GENRE_CONFIG[genre]).toMatchObject({
        color: expect.any(String),
        glow: expect.any(String),
        icon: expect.any(String),
      })
      expect(GENRE_CONFIG[genre].icon.length).toBeGreaterThan(0)
    })
  })

  it("solo mapea IDs de TMDB a géneros configurados", () => {
    Object.values(TMDB_GENRES).forEach((genre) => {
      expect(GENRE_KEYS).toContain(genre)
    })
  })
})
