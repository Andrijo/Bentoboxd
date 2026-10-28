const linkStyle = {
  color: "rgba(0,229,255,0.85)",
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
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-md)",
          letterSpacing: "2px",
          color: "var(--c-text-bright)",
        }}>
        BENTOBOXD
      </p>

      {/* TMDB exige atribución visible al usar su API. */}
      <p>
        Datos de diario de <ExternalLink href="https://letterboxd.com">Letterboxd</ExternalLink>{" "}
        y metadatos de <ExternalLink href="https://www.themoviedb.org">TMDB</ExternalLink>.
        Este producto usa la API de TMDB, pero no está avalado ni certificado por TMDB.
      </p>

      <p>Proyecto no oficial, sin relación con Letterboxd Ltd.</p>
    </footer>
  )
}
