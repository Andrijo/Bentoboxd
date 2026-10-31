const MOVIES_SECTION = { id: "rd-section-peliculas", label: "Películas" }
const SUMMARY_SECTION = { id: "rd-panel-resumen", label: "Resumen" }

// En el orden de la cuadrícula. Sin TMDB estos paneles no se muestran.
const TMDB_SECTIONS = [
  { id: "rd-panel-generos", label: "Géneros" },
  { id: "rd-panel-streaming", label: "Streaming" },
  { id: "rd-panel-opiniones", label: "Opiniones" },
  { id: "rd-panel-directores", label: "Directores" },
  { id: "rd-panel-reparto", label: "Reparto" },
  { id: "rd-panel-mejor-calificados", label: "Mejor calificados" },
  { id: "rd-panel-paises", label: "Países" },
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
  const sections = [
    MOVIES_SECTION,
    SUMMARY_SECTION,
    ...(showTmdbSections ? TMDB_SECTIONS : []),
  ]

  return (
    <nav aria-label="Secciones del perfil" className="rd-section-nav">
      {sections.map(({ id, label }) => (
        <button key={id} type="button" onClick={() => goToSection(id)}>
          {label}
        </button>
      ))}
    </nav>
  )
}
