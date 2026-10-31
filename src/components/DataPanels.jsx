import StatsSummary from "./StatsSummary/StatsSummary.jsx"
import PlatformsPanel from "./PlatformsPanel/PlatformsPanel.jsx"
import OpinionsPanel from "./OpinionsPanel/OpinionsPanel.jsx"
import TopRatedPanel from "./TopRatedPanel/TopRatedPanel.jsx"
import GenrePanel from "./GenrePanel/GenrePanel.jsx"
import DirectorsPanel from "./DirectorsPanel/DirectorsPanel.jsx"
import ActorsPanel from "./ActorsPanel/ActorsPanel.jsx"
import CountriesPanel from "./CountriesPanel/CountriesPanel.jsx"
import ErrorNotice from "./ErrorNotice.jsx"
import { formatMovieCount } from "../utils/formatters.js"

function coverageMessage({ total, matched, failed }) {
  const base = `Estadísticas basadas en ${matched} de ${formatMovieCount(total)}`
  return failed > 0
    ? `${base}: TMDB no respondió para ${failed}.`
    : `${base}: el resto no aparece en TMDB.`
}

export default function DataPanels({
  showGenrePanel,
  movies,
  genres,
  directors,
  actors,
  countries,
  platforms,
  coverage,
  loadingGenres,
  genreError,
  onRetryMetadata,
}) {
  if (!showGenrePanel) return null

  const partial = coverage && coverage.matched < coverage.total

  // Sin TMDB solo el resumen tiene datos: el resto mostraría vacíos engañosos.
  return (
    <>
      {genreError && <ErrorNotice message={genreError} onRetry={onRetryMetadata} />}
      {partial && coverage.failed > 0 && (
        <ErrorNotice message={coverageMessage(coverage)} onRetry={onRetryMetadata} />
      )}
      {partial && coverage.failed === 0 && (
        <p className="rd-coverage-note">{coverageMessage(coverage)}</p>
      )}
      <div className="rd-bento-panels" data-partial={genreError ? "" : undefined}>
        <StatsSummary movies={movies} />
        {!genreError && (
          <>
            {/* En el orden visual de la cuadrícula: el foco sigue la lectura. */}
            <GenrePanel
              genres={genres}
              movieCount={coverage?.matched || movies.length}
              movies={movies}
              loadingGenres={loadingGenres}
            />
            <PlatformsPanel platformsData={platforms} movies={movies} loading={loadingGenres} />
            <OpinionsPanel movies={movies} loading={loadingGenres} />
            <DirectorsPanel directors={directors} movies={movies} loading={loadingGenres} />
            <ActorsPanel actors={actors} movies={movies} loading={loadingGenres} />
            <TopRatedPanel movies={movies} loading={loadingGenres} />
            <CountriesPanel countries={countries} movies={movies} loading={loadingGenres} />
          </>
        )}
      </div>
    </>
  )
}
