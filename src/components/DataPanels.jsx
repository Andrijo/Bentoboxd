import PlatformsPanel from "./PlatformsPanel/PlatformsPanel.jsx"
import GenrePanel from "./GenrePanel/GenrePanel.jsx"
import DirectorsPanel from "./DirectorsPanel/DirectorsPanel.jsx"
import ActorsPanel from "./ActorsPanel/ActorsPanel.jsx"
import CountriesPanel from "./CountriesPanel/CountriesPanel.jsx"

export default function DataPanels({
  showGenrePanel,
  movies,
  genres,
  directors,
  actors,
  countries,
  platforms,
  loadingGenres,
  genreError,
}) {
  if (!showGenrePanel) return null

  return (
    <>
      <PlatformsPanel platformsData={platforms} movies={movies} loading={loadingGenres} />
      <GenrePanel genres={genres} loadingGenres={loadingGenres} genreError={genreError} />
      <DirectorsPanel directors={directors} movie={movies[0]} loading={loadingGenres} />
      <ActorsPanel actors={actors} loading={loadingGenres} />
      <CountriesPanel countries={countries} loading={loadingGenres} />
    </>
  )
}
