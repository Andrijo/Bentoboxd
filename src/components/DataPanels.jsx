import StatsSummary from "./StatsSummary/StatsSummary.jsx"
import PlatformsPanel from "./PlatformsPanel/PlatformsPanel.jsx"
import OpinionsPanel from "./OpinionsPanel/OpinionsPanel.jsx"
import TopRatedPanel from "./TopRatedPanel/TopRatedPanel.jsx"
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
    <div className="rd-bento-panels">
      <StatsSummary movies={movies} loading={loadingGenres} />
      <PlatformsPanel platformsData={platforms} movies={movies} loading={loadingGenres} error={genreError} />
      <OpinionsPanel movies={movies} loading={loadingGenres} />
      <GenrePanel genres={genres} movieCount={movies.length} loadingGenres={loadingGenres} genreError={genreError} />
      <DirectorsPanel directors={directors} loading={loadingGenres} error={genreError} />
      <ActorsPanel actors={actors} loading={loadingGenres} error={genreError} />
      <TopRatedPanel movies={movies} loading={loadingGenres} />
      <CountriesPanel countries={countries} loading={loadingGenres} error={genreError} />
    </div>
  )
}
