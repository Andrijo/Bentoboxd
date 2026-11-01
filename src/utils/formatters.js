import { getLanguage, getLocale, getMessages } from "../i18n/index.js"

/** Un formateador de Intl por idioma: crearlos en cada render sale caro. */
function perLanguage(create) {
  const cache = new Map()
  return () => {
    const language = getLanguage()
    if (!cache.has(language)) cache.set(language, create(getLocale()))
    return cache.get(language)
  }
}

export function getFlagUrl(code) {
  if (!code || code === "UNKNOWN") return null
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`
}

const countryNames = perLanguage((locale) => new Intl.DisplayNames([locale], { type: "region" }))

/** "JP" → "Japón". Con un código que Intl no reconoce devuelve el código. */
export function countryName(code) {
  try {
    return countryNames().of(code) || code
  } catch {
    return code
  }
}

/** "1 película" / "N películas". */
export function formatMovieCount(count) {
  return getMessages().common.movieCount(count)
}

/** "Bong Joon-ho" → "BJ"; "Zendaya" → "Z". */
export function getInitials(name) {
  const words = (name || "").trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ""
  const first = [...words[0]][0]
  const last = words.length > 1 ? [...words[words.length - 1]][0] : ""
  return `${first}${last}`.toLocaleUpperCase(getLocale())
}

/** 27 de 50 → "54%". Base 0 → "0%". */
export function formatPercent(count, total) {
  return `${total ? Math.round((count / total) * 100) : 0}%`
}

const watchedDateFormat = perLanguage((locale) => new Intl.DateTimeFormat(locale, {
  day: "numeric",
  month: "short",
  year: "numeric",
}))

/** "2024-05-12" → "12 may 2024". Se arma en hora local para no correr el día. */
export function formatWatchedDate(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || "")
  if (!match) return null
  const [, y, m, d] = match.map(Number)
  return watchedDateFormat().format(new Date(y, m - 1, d))
}

/** "Últimas 50 entradas · 3 mar 2026 – 12 may 2026". Sin fechas, solo la cantidad. */
export function formatFeedScope({ total, firstWatched, lastWatched }) {
  const entries = getMessages().overview.feedScope(total)
  const first = formatWatchedDate(firstWatched)
  const last = formatWatchedDate(lastWatched)
  if (!first || !last) return entries
  return `${entries} · ${first === last ? first : `${first} – ${last}`}`
}

const monthDate = (key) => {
  const [y, m] = key.split("-").map(Number)
  return new Date(y, m - 1, 1)
}
const monthFormat = perLanguage((locale) => new Intl.DateTimeFormat(locale, { month: "short" }))
const monthYearFormat = perLanguage((locale) =>
  new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }))

/** "2026-03" → "mar". */
export function formatMonth(key) {
  return monthFormat().format(monthDate(key)).replace(".", "")
}

/** "2026-03" → "mar 2026". */
export function formatMonthYear(key) {
  return monthYearFormat().format(monthDate(key)).replace(".", "")
}

/** 125 → "2 h 5 min"; 120 → "2 h"; 45 → "45 min". */
export function formatDuration(minutes) {
  const total = Math.round(minutes)
  const hours = Math.floor(total / 60)
  const rest = total % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

/** 5146 → "86 h"; 45 → "45 min". Cabe en una tarjeta, a costa de redondear. */
export function formatHours(minutes) {
  return minutes < 60 ? formatDuration(minutes) : `${Math.round(minutes / 60)} h`
}

const weekdayFormat = perLanguage((locale) => new Intl.DateTimeFormat(locale, { weekday: "long" }))

/** 0 (domingo) – 6 (sábado) → "Domingo" … "Sábado". */
export function weekdayName(day) {
  // El 4 de enero de 2026 es domingo.
  const name = weekdayFormat().format(new Date(2026, 0, 4 + day))
  return name.charAt(0).toUpperCase() + name.slice(1)
}
