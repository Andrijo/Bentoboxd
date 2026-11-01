const linkStyle = {
  color: "rgb(var(--accent-rgb) / 0.85)",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
}

function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
      {children}
      <span className="rd-sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  )
}

export default function AppFooter() {
  return (
    <footer className="rd-footer">
      <h2 className="rd-footer-title">Créditos</h2>

      {/* TMDB exige su logo y este aviso en una sección de créditos, y citar a JustWatch como fuente del streaming. */}
      <p>
        Datos de <ExternalLink href="https://letterboxd.com">Letterboxd</ExternalLink>,{" "}
        <ExternalLink href="https://www.themoviedb.org">TMDB</ExternalLink> y{" "}
        <ExternalLink href="https://www.justwatch.com">JustWatch</ExternalLink>.
        Proyecto no oficial, sin relación con Letterboxd.
      </p>

      <p>Este producto usa la API de TMDB, pero no está avalado ni certificado por TMDB.</p>

      <img src="/tmdb-logo.svg" alt="Logo de TMDB" className="rd-footer-tmdb" />
    </footer>
  )
}
