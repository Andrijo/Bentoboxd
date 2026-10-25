import { shuffle } from "../../utils/shuffle.js"

const QUESTION_COUNT = 5
const OPTION_COUNT = 4
const YEAR_SPREAD = 5
// Primera película conservada (Roundhay Garden Scene).
const FIRST_FILM_YEAR = 1888
const UNRATED = "Sin calificar"
const POSSIBLE_RATINGS = [
  "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", UNRATED,
]

/**
 * Años distractores a ±YEAR_SPREAD del correcto, sin pasar del año actual
 * (o del estreno, si la película aún no sale) ni de FIRST_FILM_YEAR.
 */
function yearOptions(correctYear, currentYear, random) {
  const correct = Number(correctYear)
  const maxYear = Math.max(currentYear, correct)
  const candidates = []

  for (let offset = -YEAR_SPREAD; offset <= YEAR_SPREAD; offset += 1) {
    const year = correct + offset
    if (offset !== 0 && year >= FIRST_FILM_YEAR && year <= maxYear) {
      candidates.push(String(year))
    }
  }

  return shuffle(candidates, random).slice(0, OPTION_COUNT - 1)
}

function ratingOptions(correct, random) {
  return shuffle(
    POSSIBLE_RATINGS.filter((rating) => rating !== correct),
    random,
  ).slice(0, OPTION_COUNT - 1)
}

export function generateQuestions(
  movies,
  { random = Math.random, currentYear = new Date().getFullYear() } = {},
) {
  return shuffle(movies, random)
    .slice(0, QUESTION_COUNT)
    .map((movie) => {
      const isYear = Boolean(movie.year) && random() > 0.5

      const qText = isYear
        ? `¿En qué año se estrenó "${movie.title}"?`
        : `¿Qué calificación le diste a "${movie.title}"?`
      const correct = isYear
        ? String(movie.year).trim()
        : movie.rating
          ? `${movie.rating}`
          : UNRATED
      const distractors = isYear
        ? yearOptions(correct, currentYear, random)
        : ratingOptions(correct, random)

      return {
        movie,
        qText,
        options: shuffle([correct, ...distractors], random),
        correct,
        isYear,
      }
    })
}
