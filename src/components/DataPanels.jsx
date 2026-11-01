import StatsSummary from "./StatsSummary/StatsSummary.jsx"
import MonthlyPanel from "./MonthlyPanel/MonthlyPanel.jsx"
import PlatformsPanel from "./PlatformsPanel/PlatformsPanel.jsx"
import OpinionsPanel from "./OpinionsPanel/OpinionsPanel.jsx"
import TopRatedPanel from "./TopRatedPanel/TopRatedPanel.jsx"
import GenrePanel from "./GenrePanel/GenrePanel.jsx"
import DirectorsPanel from "./DirectorsPanel/DirectorsPanel.jsx"
import ActorsPanel from "./ActorsPanel/ActorsPanel.jsx"
import CountriesPanel from "./CountriesPanel/CountriesPanel.jsx"
import ErrorNotice from "./ErrorNotice.jsx"
import { useMessages } from "../i18n/index.js"

function coverageMessage({ coverage: messages }, { total, matched, failed }) {
  const base = messages.base(matched, total)
  return failed > 0 ? messages.failed(base, failed) : messages.missing(base)
}

export default function DataPanels({
  showGenrePanel,
  movies,
  genres,
  directors,
  actors,
  countries,
  platforms,
  photos,
  coverage,
  loadingGenres,
  genreError,
  onRetryMetadata,
}) {
  const t = useMessages()
  if (!showGenrePanel) return null

  const partial = coverage && coverage.matched < coverage.total

  // Sin TMDB solo el resumen tiene datos: el resto mostraría vacíos engañosos.
  return (
    <>
      {genreError && <ErrorNotice message={genreError} onRetry={onRetryMetadata} />}
      {partial && coverage.failed > 0 && (
        <ErrorNotice message={coverageMessage(t, coverage)} onRetry={onRetryMetadata} />
      )}
      {partial && coverage.failed === 0 && (
        <p className="rd-coverage-note">{coverageMessage(t, coverage)}</p>
      )}
      <div className="rd-bento-panels" data-partial={genreError ? "" : undefined}>
        <StatsSummary movies={movies} />
        <MonthlyPanel movies={movies} />
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
            <DirectorsPanel directors={directors} movies={movies} photos={photos} loading={loadingGenres} />
            <ActorsPanel actors={actors} movies={movies} photos={photos} loading={loadingGenres} />
            <TopRatedPanel movies={movies} photos={photos} loading={loadingGenres} />
            <CountriesPanel countries={countries} movies={movies} loading={loadingGenres} />
          </>
        )}
      </div>
    </>
  )
}
