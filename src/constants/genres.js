export const GENRE_CONFIG = {
  Terror: { color: "#ff004c", glow: "rgba(255,0,76,0.9)" },
  Acción: { color: "#9b59b6", glow: "rgba(155,89,182,0.8)" },
  "Ciencia Ficción": {
    color: "#00bfff",
    glow: "rgba(0,191,255,0.8)",
  },
  Drama: { color: "#2ecc71", glow: "rgba(46,204,113,0.8)" },
  Comedia: { color: "#3fe5ff", glow: "rgba(250,204,21,0.4)" },
  Thriller: { color: "#ffd700", glow: "rgba(253,204,138,0.4)" },
  Romance: { color: "#c0c0c0", glow: "rgba(192,192,192,0.4)" },
  Animación: { color: "#cd7f32", glow: "rgba(205,127,50,0.4)" },
  Documental: { color: "#555555", glow: "rgba(85,85,85,0.4)" },
  Otro: { color: "#64748b", glow: "rgba(100,116,139,0.4)" },
}

export const GENRE_KEYS = Object.keys(GENRE_CONFIG)

export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

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
