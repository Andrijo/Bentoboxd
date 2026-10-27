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

const watchedDateFormat = new Intl.DateTimeFormat("es-MX", {
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
