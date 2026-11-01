import { useMessages } from "../i18n/index.js"

export default function MovieDrilldown({ label, movies }) {
  const t = useMessages()

  return (
    <div role="region" aria-label={label} className="rd-drilldown">
      <div className="rd-drilldown-title">{label}</div>
      <ul>
        {movies.map((movie) => (
          <li key={movie.link}>
            <a href={movie.link} target="_blank" rel="noopener noreferrer">
              <span className="rd-drilldown-name">{movie.title}</span>
              <span className="rd-drilldown-meta">
                {movie.year}
                {movie.rating ? ` · ${movie.rating}★` : ""}
              </span>
              <span className="rd-sr-only">{t.common.opensInLetterboxd}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
