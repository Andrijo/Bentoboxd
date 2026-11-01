import { OTHER_GENRE } from "../constants/genres.js"
import { getMessages } from "../i18n/index.js"

const WEEKS_PER_MONTH = 52 / 12
// Desde esta fracción se redondea hacia arriba con "Casi"; por debajo de una
// película por semana, el ritmo se lee mejor por mes.
const NEAR_NEXT = 0.75
const MIN_GENRE_MOVIES = 2
const MAX_TOP_GENRES = 2

function paceText(perWeek, { headline }) {
  // Con un decimal, como la tarjeta "Por semana": ambas deben coincidir.
  const rounded = Number(perWeek.toFixed(1))
  const whole = Math.floor(rounded)
  const fraction = rounded - whole

  if (rounded < NEAR_NEXT) {
    const perMonth = Math.max(1, Math.round(perWeek * WEEKS_PER_MONTH))
    return headline.aboutPerMonth(perMonth)
  }
  if (fraction === 0) return headline.perWeek(whole)
  return fraction >= NEAR_NEXT
    ? headline.almostPerWeek(whole + 1)
    : headline.overPerWeek(whole)
}

function genreText(genres, t) {
  const known = Object.entries(genres).filter(([genre]) => genre !== OTHER_GENRE)
  const topCount = Math.max(0, ...known.map(([, count]) => count))
  if (topCount < MIN_GENRE_MOVIES) return null

  const top = known.filter(([, count]) => count === topCount)
  if (top.length > MAX_TOP_GENRES) return null

  const phrases = top.map(([genre]) => t.headline.genrePhrase(genre, t.genres[genre]))
  return t.headline.mostly(phrases.join(` ${t.headline.and} `))
}

/**
 * Frase que resume el perfil, en voz neutra porque puede ser de otra persona.
 * El ritmo sale del feed; género y comparación se suman al llegar los datos
 * de TMDB. Sin fechas no hay ritmo y la frase no se sostiene: devuelve null.
 */
export function profileHeadline({ perWeek, tmdbVerdict }, genres) {
  if (perWeek === null) return null

  const t = getMessages()
  const genre = genreText(genres, t)
  const tmdb = t.headline.tmdb[tmdbVerdict]

  return [
    paceText(perWeek, t),
    genre && `, ${genre}`,
    tmdb && `${genre ? "," : ""} ${t.headline.and} ${tmdb}`,
  ].filter(Boolean).join("")
}
