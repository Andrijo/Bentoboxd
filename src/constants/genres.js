// Tonos de la rampa neutra definida en index.css (--ramp-1 más contrastado).
export const GENRE_CONFIG = {
  Terror: { color: "var(--ramp-1)" },
  Acción: { color: "var(--ramp-2)" },
  "Ciencia Ficción": { color: "var(--ramp-3)" },
  Drama: { color: "var(--ramp-4)" },
  Comedia: { color: "var(--ramp-5)" },
  Thriller: { color: "var(--ramp-6)" },
  Romance: { color: "var(--ramp-7)" },
  Animación: { color: "var(--ramp-8)" },
  Documental: { color: "var(--ramp-9)" },
  Otro: { color: "var(--ramp-10)" },
}

export const GENRE_KEYS = Object.keys(GENRE_CONFIG)

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
}
