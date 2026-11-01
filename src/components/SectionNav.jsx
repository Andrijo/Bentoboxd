import { useMessages } from "../i18n/index.js"

const MOVIES_SECTION = { id: "rd-section-peliculas", key: "movies" }
const SUMMARY_SECTION = { id: "rd-panel-resumen", key: "summary" }
const MONTHLY_SECTION = { id: "rd-panel-evolucion", key: "monthly" }

// En el orden de la cuadrícula. Sin TMDB estos paneles no se muestran.
const TMDB_SECTIONS = [
  { id: "rd-panel-generos", key: "genres" },
  { id: "rd-panel-streaming", key: "streaming" },
  { id: "rd-panel-opiniones", key: "opinions" },
  { id: "rd-panel-directores", key: "directors" },
  { id: "rd-panel-reparto", key: "cast" },
  { id: "rd-panel-mejor-calificados", key: "topRated" },
  { id: "rd-panel-paises", key: "countries" },
]

// Botones y no enlaces: el hash de la URL es la página activa (ver useHashRoute).
function goToSection(id) {
  const target = document.getElementById(id)
  if (!target) return

  target.tabIndex = -1
  target.scrollIntoView()
  target.focus({ preventScroll: true })
}

export default function SectionNav({ showTmdbSections }) {
  const t = useMessages()
  const sections = [
    MOVIES_SECTION,
    SUMMARY_SECTION,
    MONTHLY_SECTION,
    ...(showTmdbSections ? TMDB_SECTIONS : []),
  ]

  return (
    <nav aria-label={t.sections.label} className="rd-section-nav">
      {sections.map(({ id, key }) => (
        <button key={id} type="button" onClick={() => goToSection(id)}>
          {t.sections[key]}
        </button>
      ))}
    </nav>
  )
}
