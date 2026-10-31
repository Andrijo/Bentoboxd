import StatsSummary from "./StatsSummary/StatsSummary.jsx"
import PlatformsPanel from "./PlatformsPanel/PlatformsPanel.jsx"
import OpinionsPanel from "./OpinionsPanel/OpinionsPanel.jsx"
import TopRatedPanel from "./TopRatedPanel/TopRatedPanel.jsx"
import GenrePanel from "./GenrePanel/GenrePanel.jsx"
import DirectorsPanel from "./DirectorsPanel/DirectorsPanel.jsx"
import ActorsPanel from "./ActorsPanel/ActorsPanel.jsx"
import CountriesPanel from "./CountriesPanel/CountriesPanel.jsx"
import ErrorNotice from "./ErrorNotice.jsx"

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
  onRetryMetadata,
}) {
  if (!showGenrePanel) return null

  // Sin TMDB solo el resumen tiene datos: el resto mostraría vacíos engañosos.
  return (
    <>
      {genreError && <ErrorNotice message={genreError} onRetry={onRetryMetadata} />}
      <div className="rd-bento-panels" data-partial={genreError ? "" : undefined}>
        <StatsSummary movies={movies} loading={loadingGenres} />
        {!genreError && (
          <>
            <PlatformsPanel platformsData={platforms} movies={movies} loading={loadingGenres} />
            <OpinionsPanel movies={movies} loading={loadingGenres} />
            <GenrePanel genres={genres} movieCount={movies.length} loadingGenres={loadingGenres} />
            <DirectorsPanel directors={directors} loading={loadingGenres} />
            <ActorsPanel actors={actors} loading={loadingGenres} />
            <TopRatedPanel movies={movies} loading={loadingGenres} />
            <CountriesPanel countries={countries} loading={loadingGenres} />
          </>
        )}
      </div>
    </>
  )
}
