/** Un diario espaciado no debe dejar columnas demasiado angostas para tocarlas. */
export const MAX_MONTHS = 24

const pad = (month) => String(month).padStart(2, "0")

/** Meses de `first` a `last` ("AAAA-MM"), ambos incluidos. */
function monthRange(first, last) {
  const months = []
  let [year, month] = first.split("-").map(Number)

  for (let key = first; key <= last; key = `${year}-${pad(month)}`) {
    months.push(key)
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }

  return months
}

/**
 * Películas y nota media de cada mes según `watchedDate`, incluidos los meses
 * sin películas. `average` es null si en ese mes nada tiene calificación.
 */
export function computeMonthlyStats(movies) {
  const byMonth = new Map()

  for (const { watchedDate, rating } of movies) {
    if (!watchedDate) continue
    const key = watchedDate.slice(0, 7)
    const month = byMonth.get(key) || { count: 0, ratings: [] }
    month.count += 1
    if (rating > 0) month.ratings.push(rating)
    byMonth.set(key, month)
  }

  if (byMonth.size === 0) return []

  const keys = [...byMonth.keys()].sort()

  return monthRange(keys[0], keys[keys.length - 1])
    .slice(-MAX_MONTHS)
    .map((key) => {
      const { count = 0, ratings = [] } = byMonth.get(key) || {}
      return {
        key,
        count,
        average: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
      }
    })
}
