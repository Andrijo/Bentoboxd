import { describe, it, expect, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import es from "./es.js"
import en from "./en.js"
import { detectLanguage, getLocale, setLanguage, useMessages } from "./index.js"
import { GENRE_KEYS } from "../constants/genres.js"
import { countryName, formatFeedScope, formatMonth, formatMovieCount, weekdayName } from "../utils/formatters.js"
import { profileHeadline } from "../utils/profileHeadline.js"
import { filterOptions } from "../utils/movieFilters.js"

/** Rutas del diccionario con su tipo y, en funciones, cuántos argumentos reciben. */
function shape(value, path = "") {
  if (typeof value === "function") return [`${path}:fn${value.length}`]
  if (Array.isArray(value)) return [`${path}:array${value.length}`]
  if (typeof value === "object") {
    return Object.keys(value).sort().flatMap((key) => shape(value[key], `${path}.${key}`))
  }
  return [`${path}:${typeof value}`]
}

afterEach(() => {
  localStorage.clear()
})

describe("diccionarios", () => {
  it("español e inglés tienen las mismas claves y argumentos", () => {
    expect(shape(en)).toEqual(shape(es))
  })

  it("todo género tiene etiqueta en ambos idiomas", () => {
    for (const key of GENRE_KEYS) {
      expect(es.genres[key]).toBeTruthy()
      expect(en.genres[key]).toBeTruthy()
    }
  })
})

describe("detectLanguage", () => {
  it("prefiere lo guardado sobre el navegador", () => {
    expect(detectLanguage("en", "es-MX")).toBe("en")
    expect(detectLanguage("es", "en-US")).toBe("es")
  })

  it("usa español con cualquier variante del navegador en español", () => {
    expect(detectLanguage(null, "es")).toBe("es")
    expect(detectLanguage(null, "es-AR")).toBe("es")
  })

  it("usa inglés con cualquier otro idioma", () => {
    expect(detectLanguage(null, "fr-FR")).toBe("en")
    expect(detectLanguage(null, undefined)).toBe("en")
  })

  it("ignora un valor guardado desconocido", () => {
    expect(detectLanguage("de", "es-MX")).toBe("es")
  })
})

describe("setLanguage", () => {
  it("actualiza el documento y guarda la preferencia", () => {
    document.head.innerHTML = '<meta name="description" content="" />'

    setLanguage("en")

    expect(document.documentElement.lang).toBe("en")
    expect(document.querySelector('meta[name="description"]').content).toBe(en.document.description)
    expect(localStorage.getItem("bentoboxd_language:v1")).toBe("en")
    expect(getLocale()).toBe("en-US")
  })

  it("avisa a los componentes suscritos", () => {
    const { result } = renderHook(() => useMessages())
    expect(result.current).toBe(es)

    act(() => setLanguage("en"))

    expect(result.current).toBe(en)
  })
})

describe("textos en inglés", () => {
  const stats = { perWeek: 1.9, tmdbVerdict: "harsher" }

  it("arma el titular con su propia gramática", () => {
    setLanguage("en")

    expect(profileHeadline(stats, { drama: 20, scienceFiction: 20 })).toBe(
      "Almost 2 films a week, mostly drama and science fiction, and ratings lower than the audience's",
    )
    expect(profileHeadline({ ...stats, tmdbVerdict: null }, { documentary: 5 })).toBe(
      "Almost 2 films a week, mostly documentaries",
    )
  })

  it("usa singular y plural", () => {
    setLanguage("en")

    expect(formatMovieCount(1)).toBe("1 film")
    expect(formatMovieCount(2)).toBe("2 films")
    expect(formatFeedScope({ total: 1, firstWatched: null, lastWatched: null })).toBe("Latest entry")
  })

  it("formatea fechas, días y países según el idioma", () => {
    expect(formatMonth("2026-01")).toBe("ene")
    expect(weekdayName(1)).toBe("Lunes")
    expect(countryName("JP")).toBe("Japón")

    setLanguage("en")

    expect(formatMonth("2026-01")).toBe("Jan")
    expect(weekdayName(1)).toBe("Monday")
    expect(countryName("JP")).toBe("Japan")
  })

  it("traduce la opción de filtro sin nota", () => {
    setLanguage("en")

    expect(filterOptions([{ rating: null }]).ratings).toEqual([{ value: "unrated", label: "Unrated" }])
  })
})
