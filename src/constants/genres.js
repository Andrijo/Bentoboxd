export const OTHER_GENRE = "other"

// Claves de datos; las etiquetas viven en el diccionario de cada idioma.
export const TMDB_GENRES = {
  27: "horror",
  28: "action",
  878: "scienceFiction",
  18: "drama",
  35: "comedy",
  53: "thriller",
  10749: "romance",
  16: "animation",
  99: "documentary",
  12: "adventure",
  80: "crime",
  14: "fantasy",
  9648: "mystery",
  10751: "family",
}

const RAMP_STEPS = 10

// Reparte los géneros por la rampa neutra definida en index.css
// (--ramp-1 más contrastado), dejando OTHER_GENRE en el tono más tenue.
const KEYS = [...new Set(Object.values(TMDB_GENRES)), OTHER_GENRE]

export const GENRE_CONFIG = Object.fromEntries(
  KEYS.map((genre, i) => {
    const step = 1 + Math.round((i * (RAMP_STEPS - 1)) / (KEYS.length - 1))
    return [genre, { color: `var(--ramp-${step})` }]
  }),
)

export const GENRE_KEYS = Object.keys(GENRE_CONFIG)
