export const TMDB_GENRES = {
  27: "Terror",
  28: "Acción",
  878: "Ciencia Ficción",
  18: "Drama",
  35: "Comedia",
  53: "Thriller",
  10749: "Romance",
  16: "Animación",
  99: "Documental",
  12: "Aventura",
  80: "Crimen",
  14: "Fantasía",
  9648: "Misterio",
  10751: "Familiar",
}

const RAMP_STEPS = 10

// Reparte los géneros por la rampa neutra definida en index.css
// (--ramp-1 más contrastado), dejando "Otro" en el tono más tenue.
const KEYS = [...new Set(Object.values(TMDB_GENRES)), "Otro"]

export const GENRE_CONFIG = Object.fromEntries(
  KEYS.map((genre, i) => {
    const step = 1 + Math.round((i * (RAMP_STEPS - 1)) / (KEYS.length - 1))
    return [genre, { color: `var(--ramp-${step})` }]
  }),
)

export const GENRE_KEYS = Object.keys(GENRE_CONFIG)
