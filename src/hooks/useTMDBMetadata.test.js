import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { fetchMetadataFromTMDB } from "../services/tmdb.js"
import { useTMDBMetadata } from "./useTMDBMetadata.js"

vi.mock("../services/tmdb.js", () => ({
  fetchMetadataFromTMDB: vi.fn(),
}))

function abortError() {
  const error = new Error("Aborted")
  error.name = "AbortError"
  return error
}

const EMPTY_METADATA = {
  genres: {},
  directors: {},
  actors: {},
  countries: {},
  platforms: { counts: {}, logos: {} },
  rawResults: [],
}

beforeEach(() => {
  fetchMetadataFromTMDB.mockReset()
})

describe("useTMDBMetadata", () => {
  it("guarda los metadatos cuando la petición termina", async () => {
    fetchMetadataFromTMDB.mockResolvedValue({
      ...EMPTY_METADATA,
      genres: { Drama: 2 },
    })

    const { result } = renderHook(() => useTMDBMetadata())

    await act(async () => {
      await result.current.fetchMetadata(["A", "B"])
    })

    expect(result.current.genres).toEqual({ Drama: 2 })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("expone un error si la petición falla", async () => {
    fetchMetadataFromTMDB.mockRejectedValue(new Error("boom"))

    const { result } = renderHook(() => useTMDBMetadata())

    await act(async () => {
      await result.current.fetchMetadata(["A"])
    })

    expect(result.current.error).toMatch(/boom/)
    expect(result.current.loading).toBe(false)
  })

  it("aborta la petición anterior y la del desmontaje", () => {
    const signals = []
    fetchMetadataFromTMDB.mockImplementation((titles, { signal }) => {
      signals.push(signal)
      return new Promise((_, reject) => {
        signal.addEventListener("abort", () => reject(abortError()))
      })
    })

    const { result, unmount } = renderHook(() => useTMDBMetadata())

    act(() => {
      result.current.fetchMetadata(["A"])
    })
    act(() => {
      result.current.fetchMetadata(["B"])
    })

    expect(signals).toHaveLength(2)
    expect(signals[0].aborted).toBe(true)
    expect(signals[1].aborted).toBe(false)
    expect(result.current.error).toBeNull()

    unmount()
    expect(signals[1].aborted).toBe(true)
  })
})
