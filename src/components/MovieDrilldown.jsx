export default function MovieDrilldown({ label, movies }) {
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
              <span className="rd-sr-only">(se abre en Letterboxd en una pestaña nueva)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
