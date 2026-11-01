import { useMessages } from "../i18n/index.js"

const linkStyle = {
  color: "rgb(var(--accent-rgb) / 0.85)",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
}

function ExternalLink({ href, children }) {
  const t = useMessages()

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
      {children}
      <span className="rd-sr-only"> {t.common.opensInNewTab}</span>
    </a>
  )
}

export default function AppFooter() {
  const t = useMessages()

  return (
    <footer className="rd-footer">
      <h2 className="rd-footer-title">{t.footer.title}</h2>

      {/* TMDB exige su logo y este aviso en una sección de créditos, y citar a JustWatch como fuente del streaming. */}
      <p>
        {t.footer.dataFrom} <ExternalLink href="https://letterboxd.com">Letterboxd</ExternalLink>,{" "}
        <ExternalLink href="https://www.themoviedb.org">TMDB</ExternalLink> {t.footer.and}{" "}
        <ExternalLink href="https://www.justwatch.com">JustWatch</ExternalLink>.
        {" "}{t.footer.unofficial}
      </p>

      <p>{t.footer.tmdbNotice}</p>

      <img src="/tmdb-logo.svg" alt={t.footer.tmdbLogo} className="rd-footer-tmdb" />
    </footer>
  )
}
