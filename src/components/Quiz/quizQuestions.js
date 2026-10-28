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

// Calificaciones y años de menor a mayor; "Sin calificar" al final.
function sortOptions(options) {
  return [...options].sort((a, b) => {
    if (a === UNRATED) return 1
    if (b === UNRATED) return -1
    return Number(a) - Number(b)
  })
}

function ratingOptions(correct, random) {
  return shuffle(
    POSSIBLE_RATINGS.filter((rating) => rating !== correct),
    random,
  ).slice(0, OPTION_COUNT - 1)
}

function distinctValues(values) {
  return [...new Set(values.filter(Boolean))]
}

function hasEnoughOthers(pool, correct) {
  return pool.filter((value) => value !== correct).length >= OPTION_COUNT - 1
}

function otherOptions(pool, correct, random) {
  return shuffle(
    pool.filter((value) => value !== correct),
    random,
  ).slice(0, OPTION_COUNT - 1)
}

const NUMERIC_TYPES = new Set(["rating", "year"])

// Cada tipo declara cuándo puede preguntarse con los datos disponibles.
const QUESTION_TYPES = [
  {
    type: "rating",
    available: () => true,
    build: (movie) => ({
      qText: `¿Qué calificación le diste a "${movie.title}"?`,
      correct: movie.rating ? `${movie.rating}` : UNRATED,
    }),
    distractors: (correct, _pool, random) => ratingOptions(correct, random),
  },
  {
    type: "year",
    available: (movie) => Boolean(movie.year),
    build: (movie) => ({
      qText: `¿En qué año se estrenó "${movie.title}"?`,
      correct: String(movie.year).trim(),
    }),
    distractors: (correct, _pool, random, currentYear) =>
      yearOptions(correct, currentYear, random),
  },
  {
    type: "director",
    available: (movie, pool) =>
      Boolean(movie.directors?.[0]) &&
      hasEnoughOthers(pool.directors, movie.directors[0]),
    build: (movie) => ({
      qText: `¿Quién dirigió "${movie.title}"?`,
      correct: movie.directors[0],
    }),
    distractors: (correct, pool, random) =>
      otherOptions(pool.directors, correct, random),
  },
  {
    type: "poster",
    available: (movie, pool) =>
      Boolean(movie.poster) && hasEnoughOthers(pool.titles, movie.title),
    build: (movie) => ({
      qText: "¿Qué película es este póster?",
      correct: movie.title,
    }),
    distractors: (correct, pool, random) =>
      otherOptions(pool.titles, correct, random),
  },
]

export function generateQuestions(
  movies,
  { random = Math.random, currentYear = new Date().getFullYear() } = {},
) {
  const pool = {
    directors: distinctValues(movies.flatMap((movie) => movie.directors || [])),
    titles: distinctValues(movies.map((movie) => movie.title)),
  }

  return shuffle(movies, random)
    .slice(0, QUESTION_COUNT)
    .map((movie) => {
      const candidates = QUESTION_TYPES.filter((t) => t.available(movie, pool))
      const kind = candidates[Math.floor(random() * candidates.length)]
      const { qText, correct } = kind.build(movie)
      const distractors = kind.distractors(correct, pool, random, currentYear)

      return {
        movie,
        qText,
        options: NUMERIC_TYPES.has(kind.type)
          ? sortOptions([correct, ...distractors])
          : shuffle([correct, ...distractors], random),
        correct,
        type: kind.type,
        isYear: kind.type === "year",
      }
    })
}
