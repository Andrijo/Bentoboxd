import { formatMovieCount } from "./formatters.js"

const WEEKS_PER_MONTH = 52 / 12
// Desde esta fracción se redondea hacia arriba con "Casi"; por debajo de una
// película por semana, el ritmo se lee mejor por mes.
const NEAR_NEXT = 0.75
const MIN_GENRE_MOVIES = 2
const MAX_TOP_GENRES = 2

const GENRE_PHRASES = { Documental: "documentales", Familiar: "familiares" }

const TMDB_PHRASES = {
  kinder: "notas más altas que las del público",
  harsher: "notas más bajas que las del público",
  same: "notas parecidas a las del público",
}

function paceText(perWeek) {
  // Con un decimal, como la tarjeta "Por semana": ambas deben coincidir.
  const rounded = Number(perWeek.toFixed(1))
  const whole = Math.floor(rounded)
  const fraction = rounded - whole

  if (rounded < NEAR_NEXT) {
    const perMonth = Math.max(1, Math.round(perWeek * WEEKS_PER_MONTH))
    return `Cerca de ${formatMovieCount(perMonth)} al mes`
  }
  if (fraction === 0) return `${formatMovieCount(whole)} por semana`
  return fraction >= NEAR_NEXT
    ? `Casi ${formatMovieCount(whole + 1)} por semana`
    : `Más de ${formatMovieCount(whole)} por semana`
}

function genreText(genres) {
  const known = Object.entries(genres).filter(([genre]) => genre !== "Otro")
  const topCount = Math.max(0, ...known.map(([, count]) => count))
  if (topCount < MIN_GENRE_MOVIES) return null

  const top = known.filter(([, count]) => count === topCount)
  if (top.length > MAX_TOP_GENRES) return null

  const phrases = top.map(([genre]) => GENRE_PHRASES[genre] || `de ${genre.toLowerCase()}`)
  return `sobre todo ${phrases.join(" y ")}`
}

/**
 * Frase que resume el perfil, en voz neutra porque puede ser de otra persona.
 * El ritmo sale del feed; género y comparación se suman al llegar los datos
 * de TMDB. Sin fechas no hay ritmo y la frase no se sostiene: devuelve null.
 */
export function profileHeadline({ perWeek, tmdbVerdict }, genres) {
  if (perWeek === null) return null

  const genre = genreText(genres)
  const tmdb = TMDB_PHRASES[tmdbVerdict]

  return [
    paceText(perWeek),
    genre && `, ${genre}`,
    tmdb && `${genre ? "," : ""} y ${tmdb}`,
  ].filter(Boolean).join("")
}
