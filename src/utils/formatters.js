export function getFlagUrl(code) {
  if (!code || code === "UNKNOWN") return null
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`
}

const countryNames = new Intl.DisplayNames(["es-MX"], { type: "region" })

/** "JP" → "Japón". Con un código que Intl no reconoce devuelve el código. */
export function countryName(code) {
  try {
    return countryNames.of(code) || code
  } catch {
    return code
  }
}

/** "1 película" / "N películas". */
export function formatMovieCount(count) {
  return `${count} película${count === 1 ? "" : "s"}`
}

/** 27 de 50 → "54%". Base 0 → "0%". */
export function formatPercent(count, total) {
  return `${total ? Math.round((count / total) * 100) : 0}%`
}

const watchedDateFormat =new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

/** "2024-05-12" → "12 may 2024". Se arma en hora local para no correr el día. */
export function formatWatchedDate(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || "")
  if (!match) return null
  const [, y, m, d] = match.map(Number)
  return watchedDateFormat.format(new Date(y, m - 1, d))
}

/** 125 → "2 h 5 min"; 120 → "2 h"; 45 → "45 min". */
export function formatDuration(minutes) {
  const total = Math.round(minutes)
  const hours = Math.floor(total / 60)
  const rest = total % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

const weekdayFormat = new Intl.DateTimeFormat("es-MX", { weekday: "long" })

/** 0 (domingo) – 6 (sábado) → "Domingo" … "Sábado". */
export function weekdayName(day) {
  // El 4 de enero de 2026 es domingo.
  const name = weekdayFormat.format(new Date(2026, 0, 4 + day))
  return name.charAt(0).toUpperCase() + name.slice(1)
}
