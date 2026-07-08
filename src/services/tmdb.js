import { TMDB_API_KEY, TMDB_GENRES } from "../constants/genres.js"

export async function fetchMetadataFromTMDB(movieTitles) {
  const genreCounts = {
    Terror: 0,
    Acción: 0,
    "Ciencia Ficción": 0,
    Drama: 0,
    Comedia: 0,
    Thriller: 0,
    Romance: 0,
    Animación: 0,
    Documental: 0,
    Otro: 0,
  }
  const directorCounts = {}
  const actorCounts = {}
  const countryCounts = {}
  const platformCounts = {}
  const platformLogos = {}

  const fetchPromises = movieTitles.map(async (title) => {
    try {
      const cleanTitle = title.split(" - ")[0]
      const searchRes = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&language=es-MX`,
      )
      const searchData = await searchRes.json()

      if (searchData.results?.length > 0) {
        const movieInfo = searchData.results[0]
        const detailsRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movieInfo.id}?api_key=${TMDB_API_KEY}&append_to_response=credits,watch/providers&language=es-MX`,
        )
        const detailsData = await detailsRes.json()

        const platforms =
          detailsData["watch/providers"]?.results?.MX?.flatrate?.map((p) => {
            platformLogos[p.provider_name] =
              `https://image.tmdb.org/t/p/w45${p.logo_path}`
            return p.provider_name
          }) || []

        const director = detailsData.credits?.crew?.find(
          (p) => p.job === "Director",
        )?.name
        const actors =
          detailsData.credits?.cast?.slice(0, 9).map((a) => a.name) || []
        const country =
          detailsData.production_countries?.[0]?.iso_3166_1 || "UNKNOWN"

        const globalRating = detailsData.vote_average
          ? (detailsData.vote_average / 2).toFixed(1)
          : null

        return {
          title,
          genre: TMDB_GENRES[movieInfo.genre_ids?.[0]] || "Otro",
          director,
          actors,
          country,
          platforms,
          globalRating,
          popularity: detailsData.popularity || 0,
          releaseDate: detailsData.release_date || null,
        }
      }
      return null
    } catch {
      return null
    }
  })

  const results = await Promise.all(fetchPromises)

  results.forEach((item) => {
    if (!item) return
    genreCounts[item.genre] += 1
    if (item.director)
      directorCounts[item.director] = (directorCounts[item.director] || 0) + 1
    item.actors.forEach((a) => {
      actorCounts[a] = (actorCounts[a] || 0) + 1
    })
    if (item.country !== "UNKNOWN")
      countryCounts[item.country] = (countryCounts[item.country] || 0) + 1
    item.platforms.forEach((p) => {
      platformCounts[p] = (platformCounts[p] || 0) + 1
    })
  })

  return {
    genres: genreCounts,
    directors: directorCounts,
    actors: actorCounts,
    countries: countryCounts,
    platforms: { counts: platformCounts, logos: platformLogos },
    rawResults: results,
  }
}
