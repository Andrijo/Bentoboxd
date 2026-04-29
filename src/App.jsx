import { useState, useCallback, useMemo, useEffect } from "react"
import HighLowGame from "./HighLowGame.jsx"

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function extractPoster(description) {
  const match = description?.match(/<img[^>]+src="([^"]+)"/)
  return match ? match[1] : null
}

function extractRating(description) {
  const match = description?.match(/Rated: ([★½]+)/)
  if (!match) return null
  const raw = match[1]
  const full = (raw.match(/★/g) || []).length
  const half = raw.includes("½") ? 0.5 : 0
  return full + half
}

function extractTitle(description) {
  const match = description?.match(/<p><strong>([^<]+)<\/strong><br>/)
  return match ? match[1] : null
}

// ─────────────────────────────────────────────
// Genre config
// ─────────────────────────────────────────────
const GENRE_CONFIG = {
  Terror: { color: "#ff004c", glow: "rgba(255,0,76,0.9)" },
  Acción: { color: "#9b59b6", glow: "rgba(155,89,182,0.8)" },
  "Ciencia Ficción": {
    color: "#00bfff",
    glow: "rgba(0,191,255,0.8)",
  },
  Drama: { color: "#2ecc71", glow: "rgba(46,204,113,0.8)" },
  Comedia: { color: "#3fe5ff", glow: "rgba(250,204,21,0.4)" },
  Thriller: { color: "#ffd700", glow: "rgba(253,204,138,0.4)" },
  Romance: { color: "#c0c0c0", glow: "rgba(192,192,192,0.4)" },
  Animación: { color: "#cd7f32", glow: "rgba(205,127,50,0.4)" },
  Documental: { color: "#555555", glow: "rgba(85,85,85,0.4)" },
  Otro: { color: "#64748b", glow: "rgba(100,116,139,0.4)" },
}

const GENRE_KEYS = Object.keys(GENRE_CONFIG)

// ─────────────────────────────────────────────
// TMDB API Metadata fetcher (Sincronización Total + Streaming)
// ─────────────────────────────────────────────
const TMDB_API_KEY = "74ec8c652ebdde0b5dda418dc0a79d91"

const TMDB_GENRES = {
  27: "Terror",
  28: "Acción",
  878: "Ciencia Ficción",
  18: "Drama",
  35: "Comedia",
  53: "Thriller",
  10749: "Romance",
  16: "Animación",
  99: "Documental",
}
// ─────────────────────────────────────────────
// TMDB API Metadata fetcher (Actualizado con resultados individuales)
// ─────────────────────────────────────────────
async function fetchMetadataFromTMDB(movieTitles) {
  const genreCounts = {
    Terror: 0,
    Acción: 0,
    "Ciencia Ficción": 0,
    Drama: 0,
    Comedia: 0,
    Thriller: 0,
    Romance: 0,
    Animación: 0,
    Documental: 0,
    Otro: 0,
  }
  const directorCounts = {}
  const actorCounts = {}
  const countryCounts = {}
  const platformCounts = {}
  const platformLogos = {}

  const fetchPromises = movieTitles.map(async (title) => {
    try {
      const cleanTitle = title.split(" - ")[0]
      const searchRes = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&language=es-MX`,
      )
      const searchData = await searchRes.json()

      if (searchData.results?.length > 0) {
        const movieInfo = searchData.results[0]
        const detailsRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movieInfo.id}?api_key=${TMDB_API_KEY}&append_to_response=credits,watch/providers&language=es-MX`,
        )
        const detailsData = await detailsRes.json()

        const platforms =
          detailsData["watch/providers"]?.results?.MX?.flatrate?.map((p) => {
            platformLogos[p.provider_name] =
              `https://image.tmdb.org/t/p/w45${p.logo_path}`
            return p.provider_name
          }) || []

        const director = detailsData.credits?.crew?.find(
          (p) => p.job === "Director",
        )?.name
        const actors =
          detailsData.credits?.cast?.slice(0, 9).map((a) => a.name) || []
        const country =
          detailsData.production_countries?.[0]?.iso_3166_1 || "UNKNOWN"

        // Extraemos el rating global y lo convertimos a una escala de 0 a 5
        const globalRating = detailsData.vote_average 
          ? (detailsData.vote_average / 2).toFixed(1) 
          : null;

        return {
          title,
          genre: TMDB_GENRES[movieInfo.genre_ids?.[0]] || "Otro",
          director,
          actors,
          country,
          platforms,
          globalRating,
          popularity: detailsData.popularity || 0,
          releaseDate: detailsData.release_date || null,

        }
      }
      return null
    } catch (e) {
      return null
    }
  })

  const results = await Promise.all(fetchPromises)

  results.forEach((item) => {
    if (!item) return
    genreCounts[item.genre] += 1
    if (item.director)
      directorCounts[item.director] = (directorCounts[item.director] || 0) + 1
    item.actors.forEach((a) => {
      actorCounts[a] = (actorCounts[a] || 0) + 1
    })
    if (item.country !== "UNKNOWN")
      countryCounts[item.country] = (countryCounts[item.country] || 0) + 1
    item.platforms.forEach((p) => {
      platformCounts[p] = (platformCounts[p] || 0) + 1
    })
  })

  return {
    genres: genreCounts,
    directors: directorCounts,
    actors: actorCounts,
    countries: countryCounts,
    platforms: { counts: platformCounts, logos: platformLogos },
    rawResults: results, // <-- DEVOLVEMOS LOS RESULTADOS INDIVIDUALES
  }
}

function PlatformsPanel({ platformsData, movies, loading }) {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const { counts, logos } = platformsData || { counts: {}, logos: {} };
  
  const topPlatforms = Object.entries(counts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const themeColor = "#e81cff";

  // Filtrar películas por la plataforma seleccionada
  const filteredMovies = movies.filter(m => m.platforms?.includes(selectedPlatform));

  return (
    <div style={{ margin: "0 40px 40px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px", background: "rgba(255,255,255,0.02)", overflow: "hidden", fontFamily: "'Space Mono', monospace" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "2px", color: "#F0EDE5" }}>
          STREAMING
        </div>
        {selectedPlatform && (
          <button onClick={() => setSelectedPlatform(null)} style={{ background: "none", border: `1px solid ${themeColor}`, color: themeColor, fontSize: "0.6rem", padding: "4px 10px", cursor: "pointer", textTransform: "uppercase" }}>
            ✕ Desvincular
          </button>
        )}
      </div>
      
      <div style={{ padding: "24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", fontSize: "0.55rem", letterSpacing: "4px", color: themeColor, animation: "pulse 1.2s ease infinite" }}>◈ ESCANEANDO FRECUENCIAS...</div>
        ) : (
          <>
            {/* Grid de Plataformas */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: selectedPlatform ? "24px" : "0" }}>
              {topPlatforms.map(([name, count]) => (
                <div key={name} 
                  onClick={() => setSelectedPlatform(name)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", background: selectedPlatform === name ? `${themeColor}15` : "rgba(0,0,0,0.4)",
                    padding: "10px", borderRadius: "4px", border: `1px solid ${selectedPlatform === name ? themeColor : "rgba(255,255,255,0.05)"}`,
                    cursor: "pointer", transition: "all 0.2s"
                  }}>
                  <img src={logos[name]} alt={name} style={{ width: "30px", height: "30px", borderRadius: "4px", border: `1px solid ${themeColor}30` }} />
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: "0.7rem", color: "#DBD5CA", fontWeight: "bold", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{name}</div>
                    <div style={{ fontSize: "0.55rem", color: themeColor }}>{count} ITEMS</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Listado de Películas (Drill-down) */}
            {selectedPlatform && (
              <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${themeColor}30`, padding: "16px", borderRadius: "4px", animation: "fadeSlideIn 0.3s ease both" }}>
                <div style={{ fontSize: "0.6rem", color: themeColor, letterSpacing: "2px", marginBottom: "12px", borderBottom: `1px solid ${themeColor}20`, paddingBottom: "8px" }}>
                  MOSTRANDO ARCHIVOS EN: {selectedPlatform.toUpperCase()}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {filteredMovies.map((m, i) => (
                    <div key={i} style={{ fontSize: "0.75rem", color: "#F0EDE5", display: "flex", justifyContent: "space-between" }}>
                      <span>> {m.title}</span>
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>{m.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HUD Gauges Chart (Medidores de Sistema)
// ─────────────────────────────────────────────
function GaugesChart({ genres }) {
  // Filtramos y ordenamos los géneros de mayor a menor
  const sortedGenres = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0).sort(
    (a, b) => genres[b] - genres[a],
  )

  // Tomamos el valor máximo como nuestro 100% (la barra llena)
  const maxCount = Math.max(...sortedGenres.map((k) => genres[k]), 1)

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
        gap: "24px",
        width: "100%",
        padding: "10px",
      }}>
      {sortedGenres.map((k, i) => {
        const count = genres[k]
        const cfg = GENRE_CONFIG[k]
        const percent = count / maxCount

        // Matemáticas para dibujar el arco SVG
        const r = 36
        const circ = 2 * Math.PI * r
        const dashOffset = circ - percent * circ

        return (
          <div
            key={k}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              animation: "fadeSlideIn 0.5s ease both",
              animationDelay: `${i * 60}ms`,
            }}>
            {/* Medidor Circular */}
            <svg
              viewBox="0 0 100 100"
              style={{ width: "80px", height: "80px", overflow: "visible" }}>
              <defs>
                <filter id={`glow-${k}`}>
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Anillo de fondo suave */}
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="6"
              />

              {/* Anillo decorativo interior (estilo mira o radar) */}
              <circle
                cx="50"
                cy="50"
                r={r - 12}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
                strokeDasharray="2 4"
              />

              {/* Arco de progreso Neón */}
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={cfg.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 50 50)"
                filter={`url(#glow-${k})`}
                style={{
                  transition:
                    "stroke-dashoffset 1.5s cubic-bezier(0.1, 0.8, 0.2, 1)",
                }}
              />

              {/* Número central */}
              <text
                x="50"
                y="58"
                textAnchor="middle"
                fontSize="26"
                fontFamily="'Bebas Neue', sans-serif"
                fill="#F0EDE5">
                {count}
              </text>
            </svg>

            {/* Etiquetas */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  fontFamily: "'Space Mono', monospace",
                  color: cfg.color,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}>
                {cfg.icon} {k}
              </div>
              <div
                style={{
                  fontSize: "0.5rem",
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "'Space Mono', monospace",
                  marginTop: "2px",
                }}>
                {Math.round(percent * 100)}% DEL MÁXIMO
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────
// Matrix Chart (Grid de Nodos)
// ─────────────────────────────────────────────
function MatrixChart({ genres }) {
  const [hoveredGenre, setHoveredGenre] = useState(null)

  // Filtramos los que tienen 0 y ordenamos de mayor a menor
  const sortedGenres = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0).sort(
    (a, b) => genres[b] - genres[a],
  )

  const totalFilms = Object.values(genres).reduce((a, b) => a + b, 0)

  // Generamos un arreglo donde cada elemento es 1 película (su nombre de género)
  const blocks = []
  sortedGenres.forEach((genre) => {
    const count = genres[genre]
    for (let i = 0; i < count; i++) {
      blocks.push(genre)
    }
  })

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "340px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
      }}>
      {/* Grid de Nodos */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          justifyContent: "center",
          alignContent: "flex-start",
        }}>
        {blocks.map((genre, i) => {
          const cfg = GENRE_CONFIG[genre]
          const isHovered = hoveredGenre === genre
          const isDimmed = hoveredGenre !== null && !isHovered

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredGenre(genre)}
              onMouseLeave={() => setHoveredGenre(null)}
              style={{
                width: "16px",
                height: "16px",
                background: isDimmed
                  ? "rgba(255,255,255,0.05)"
                  : `linear-gradient(135deg, ${cfg.color}90, ${cfg.color}40)`,
                border: isDimmed
                  ? "1px solid rgba(255,255,255,0.05)"
                  : `1px solid ${cfg.color}80`,
                borderRadius: "2px",
                boxShadow: isHovered
                  ? `0 0 10px ${cfg.glow}, 0 0 20px ${cfg.glow}`
                  : isDimmed
                    ? "none"
                    : `0 0 4px ${cfg.glow}`,
                transition: "all 0.2s ease",
                cursor: "crosshair",
                animation: "fadeSlideIn 0.3s ease both",
                animationDelay: `${i * 15}ms`, // Efecto de cascada al cargar
              }}
            />
          )
        })}
      </div>

      {/* Panel de Información Central */}
      <div
        style={{
          height: "50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
        {hoveredGenre ? (
          <>
            <div
              style={{
                fontSize: "1.2rem",
                fontFamily: "'Bebas Neue', sans-serif",
                color: GENRE_CONFIG[hoveredGenre].color,
                letterSpacing: "2px",
              }}>
              {GENRE_CONFIG[hoveredGenre].icon} {hoveredGenre}
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                fontFamily: "'Space Mono', monospace",
                color: "rgba(255,255,255,0.5)",
              }}>
              {genres[hoveredGenre]} NODOS DETECTADOS (
              {((genres[hoveredGenre] / totalFilms) * 100).toFixed(1)}%)
            </div>
          </>
        ) : (
          <div
            style={{
              fontSize: "0.65rem",
              fontFamily: "'Space Mono', monospace",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "2px",
            }}>
            [ PASE EL CURSOR PARA ANALIZAR NODOS ]
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Radar Chart (SVG)
// ─────────────────────────────────────────────
function RadarChart({ genres }) {
  const cx = 200,
    cy = 200,
    r = 140
  const keys = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0 || true)
  const total = Object.values(genres).reduce((a, b) => a + b, 0) || 1
  const n = keys.length
  const levels = [0.25, 0.5, 0.75, 1.0]

  const angleOf = (i) => (Math.PI * 2 * i) / n - Math.PI / 2
  const pointAt = (i, fraction) => ({
    x: cx + r * fraction * Math.cos(angleOf(i)),
    y: cy + r * fraction * Math.sin(angleOf(i)),
  })

  const gridPolygon = (fraction) =>
    keys
      .map((_, i) => {
        const p = pointAt(i, fraction)
        return `${p.x},${p.y}`
      })
      .join(" ")

  const dataPoints = keys.map((k, i) => {
    const val = Math.min((genres[k] || 0) / total, 1)
    // Scale: map 0→0.05 and 1→0.95 for visual clarity
    const frac = val > 0 ? 0.08 + val * 0.87 : 0
    return pointAt(i, frac)
  })

  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") +
    " Z"

  const labelAt = (i) => {
    const p = pointAt(i, 1.25)
    return p
  }

  return (
    <svg viewBox="0 0 400 400" style={{ width: "100%", maxWidth: "400px" }}>
      {/* Grid circles */}
      {levels.map((frac, li) => (
        <polygon
          key={li}
          points={gridPolygon(frac)}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {keys.map((_, i) => {
        const p = pointAt(i, 1)
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        )
      })}

      {/* Data fill */}
      <path
        d={dataPath}
        fill="rgba(0,229,255,0.08)"
        stroke="rgba(0,229,255,0.5)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => {
        const k = keys[i]
        const cfg = GENRE_CONFIG[k]
        const val = genres[k] || 0
        if (val === 0) return null
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={5} fill={cfg.color} opacity={0.9} />
            <circle cx={p.x} cy={p.y} r={9} fill={cfg.color} opacity={0.15} />
          </g>
        )
      })}

      {/* Labels */}
      {keys.map((k, i) => {
        const lp = labelAt(i)
        const cfg = GENRE_CONFIG[k]
        const val = genres[k] || 0
        const angle = angleOf(i) * (180 / Math.PI)
        return (
          <g key={i}>
            <text
              x={lp.x}
              y={lp.y - 6}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontFamily="'Space Mono', monospace"
              fill={val > 0 ? cfg.color : "rgba(255,255,255,0.2)"}
              letterSpacing="0.5">
              {cfg.icon} {k}
            </text>
            {val > 0 && (
              <text
                x={lp.x}
                y={lp.y + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fontFamily="'Space Mono', monospace"
                fill="rgba(255,255,255,0.4)">
                {val} film{val !== 1 ? "s" : ""}
              </text>
            )}
          </g>
        )
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill="rgba(0,229,255,0.4)" />
    </svg>
  )
}

// ─────────────────────────────────────────────
// Bar Chart (Ecualizador)
// ─────────────────────────────────────────────
function BarChart({ genres }) {
  // Filtramos los que tienen 0 y ordenamos de mayor a menor
  const sortedGenres = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0).sort(
    (a, b) => genres[b] - genres[a],
  )

  // Encontramos el valor máximo para que esa barra mida el 100% de ancho
  const maxCount = Math.max(...sortedGenres.map((k) => genres[k]), 1)

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "10px 0",
      }}>
      {sortedGenres.map((k, i) => {
        const count = genres[k]
        const cfg = GENRE_CONFIG[k]
        const widthPct = (count / maxCount) * 100

        return (
          <div
            key={k}
            style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Etiqueta del Género */}
            <div
              style={{
                width: "90px",
                fontSize: "0.65rem",
                fontFamily: "'Space Mono', monospace",
                color: "rgba(255,255,255,0.7)",
                textAlign: "right",
                letterSpacing: "0.5px",
                whiteSpace: "nowrap",
              }}>
              {cfg.icon} {k}
            </div>

            {/* Contenedor de la Barra */}
            <div
              style={{
                flex: 1,
                height: "12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "2px",
                overflow: "visible", // Permitir que el resplandor salga
                position: "relative",
              }}>
              {/* Barra de color neón */}
              <div
                style={{
                  height: "100%",
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, transparent, ${cfg.color})`,
                  boxShadow: `0 0 12px ${cfg.glow}`,
                  borderRight: `2px solid ${cfg.color}`,
                  animation: "fadeSlideIn 0.8s ease both",
                  animationDelay: `${i * 100}ms`,
                  position: "relative",
                }}>
                {/* Detalle decorativo al final de la barra */}
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    background: "#fff",
                    opacity: 0.5,
                  }}
                />
              </div>
            </div>

            {/* Contador */}
            <div
              style={{
                width: "25px",
                fontSize: "0.8rem",
                fontFamily: "'Bebas Neue', sans-serif",
                color: cfg.color,
                letterSpacing: "1px",
              }}>
              {count}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────
// Donut Chart (SVG)
// ─────────────────────────────────────────────
function DonutChart({ genres }) {
  const cx = 180,
    cy = 180,
    outerR = 130,
    innerR = 72
  const total = Object.values(genres).reduce((a, b) => a + b, 0) || 1
  const activeGenres = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0)

  const [hovered, setHovered] = useState(null)

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const arcPath = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArc = endAngle - startAngle <= 180 ? "0" : "1"
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
  }

  let currentAngle = 0
  const slices = activeGenres.map((k) => {
    const count = genres[k] || 0
    const fraction = count / total
    const sweep = fraction * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + sweep
    currentAngle += sweep
    const midAngle = startAngle + sweep / 2
    const cfg = GENRE_CONFIG[k]
    return { k, count, fraction, startAngle, endAngle, midAngle, cfg }
  })

  const hoveredSlice = hovered !== null ? slices[hovered] : null

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "32px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
      <svg
        viewBox="0 0 360 360"
        style={{ width: "100%", maxWidth: "300px", overflow: "visible" }}>
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {slices.map((s, i) => {
          const isHovered = hovered === i
          const gap = 2
          const outerRad = isHovered ? outerR + 8 : outerR
          const outerPath = arcPath(
            cx,
            cy,
            outerRad,
            s.startAngle + gap * 0.5,
            s.endAngle - gap * 0.5,
          )
          const innerPath = arcPath(
            cx,
            cy,
            innerR,
            s.endAngle - gap * 0.5,
            s.startAngle + gap * 0.5,
          )
          const startOuter = polarToCartesian(
            cx,
            cy,
            outerRad,
            s.endAngle - gap * 0.5,
          )
          const endInner = polarToCartesian(
            cx,
            cy,
            innerR,
            s.endAngle - gap * 0.5,
          )
          const startInner = polarToCartesian(
            cx,
            cy,
            innerR,
            s.startAngle + gap * 0.5,
          )
          const endOuter = polarToCartesian(
            cx,
            cy,
            outerRad,
            s.startAngle + gap * 0.5,
          )
          const largeArc = s.endAngle - s.startAngle > 180 ? "1" : "0"

          const fullPath = `
            M ${polarToCartesian(cx, cy, outerRad, s.startAngle + gap * 0.5).x} ${polarToCartesian(cx, cy, outerRad, s.startAngle + gap * 0.5).y}
            A ${outerRad} ${outerRad} 0 ${largeArc} 1 ${polarToCartesian(cx, cy, outerRad, s.endAngle - gap * 0.5).x} ${polarToCartesian(cx, cy, outerRad, s.endAngle - gap * 0.5).y}
            L ${polarToCartesian(cx, cy, innerR, s.endAngle - gap * 0.5).x} ${polarToCartesian(cx, cy, innerR, s.endAngle - gap * 0.5).y}
            A ${innerR} ${innerR} 0 ${largeArc} 0 ${polarToCartesian(cx, cy, innerR, s.startAngle + gap * 0.5).x} ${polarToCartesian(cx, cy, innerR, s.startAngle + gap * 0.5).y}
            Z
          `

          return (
            <path
              key={s.k}
              d={fullPath}
              fill={s.cfg.color}
              opacity={hovered === null ? 0.85 : isHovered ? 1 : 0.35}
              filter={isHovered ? "url(#glow)" : undefined}
              style={{ cursor: "pointer", transition: "opacity 0.2s, d 0.2s" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          )
        })}

        {/* Center info */}
        {hoveredSlice ? (
          <>
            <text
              x={cx}
              y={cy - 16}
              textAnchor="middle"
              fontSize="22"
              fill={hoveredSlice.cfg.color}>
              {hoveredSlice.cfg.icon}
            </text>
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fontSize="9"
              fill={hoveredSlice.cfg.color}
              fontFamily="'Space Mono', monospace"
              letterSpacing="0.5">
              {hoveredSlice.k}
            </text>
            <text
              x={cx}
              y={cy + 18}
              textAnchor="middle"
              fontSize="11"
              fill="white"
              fontFamily="'Space Mono', monospace"
              fontWeight="bold">
              {hoveredSlice.count} film{hoveredSlice.count !== 1 ? "s" : ""}
            </text>
            <text
              x={cx}
              y={cy + 32}
              textAnchor="middle"
              fontSize="8"
              fill="rgba(255,255,255,0.4)"
              fontFamily="'Space Mono', monospace">
              {Math.round(hoveredSlice.fraction * 100)}%
            </text>
          </>
        ) : (
          <>
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              fontSize="22"
              fill="rgba(255,255,255,0.8)"
              fontFamily="'Bebas Neue', sans-serif"
              letterSpacing="2">
              {total}
            </text>
            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              fontSize="7"
              fill="rgba(255,255,255,0.3)"
              fontFamily="'Space Mono', monospace"
              letterSpacing="1">
              FILMS
            </text>
          </>
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {slices.map((s, i) => (
          <div
            key={s.k}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              opacity: hovered === null ? 1 : hovered === i ? 1 : 0.4,
              transition: "opacity 0.2s",
            }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                background: s.cfg.color,
                flexShrink: 0,
                boxShadow: hovered === i ? `0 0 8px ${s.cfg.glow}` : "none",
                transition: "box-shadow 0.2s",
              }}
            />
            <span
              style={{
                fontSize: "0.6rem",
                fontFamily: "'Space Mono', monospace",
                color: hovered === i ? s.cfg.color : "rgba(255,255,255,0.6)",
                transition: "color 0.2s",
                letterSpacing: "0.5px",
              }}>
              {s.cfg.icon} {s.k}
            </span>
            <span
              style={{
                marginLeft: "auto",
                paddingLeft: "12px",
                fontSize: "0.55rem",
                fontFamily: "'Space Mono', monospace",
                color: "rgba(255,255,255,0.35)",
              }}>
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Genre Chart Panel
// ─────────────────────────────────────────────
function GenrePanel({ genres, loadingGenres, genreError }) {
  const [chartType, setChartType] = useState("donut")

  const total = Object.values(genres || {}).reduce((a, b) => a + b, 0)
  const hasData = total > 0

  return (
    <div
      style={{
        margin: "0 40px 40px",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "4px",
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}>
      {/* Panel header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}>
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "2rem",
              letterSpacing: "2px",
              color: "#F0EDE5",
              lineHeight: 1,
            }}>
            TOP GÉNEROS
          </div>
          {hasData && (
            <div
              style={{
                fontSize: "0.5rem",
                color: "rgba(255,255,255,0.25)",
                letterSpacing: "2px",
                marginTop: "4px",
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase",
              }}>
              Clasificado por TMDB — {total} películas consumidas
            </div>
          )}
        </div>

        {/* Chart type toggle */}
        {hasData && (
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "rgba(0,0,0,0.3)",
              borderRadius: "3px",
              padding: "3px",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
            {[
              { key: "donut", label: "◉ Pastel" },
              { key: "radar", label: "⬡ Radar" },
              { key: "bar", label: "⬡ Barras" },
              { key: "matrix", label: "⬡ Matriz" },
              { key: "gauges", label: "⬡ Hub" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setChartType(key)}
                style={{
                  background:
                    chartType === key ? "rgba(0,229,255,0.15)" : "transparent",
                  border:
                    chartType === key
                      ? "1px solid rgba(0,229,255,0.35)"
                      : "1px solid transparent",
                  color:
                    chartType === key ? "#00e5ff" : "rgba(255,255,255,0.3)",
                  padding: "5px 12px",
                  borderRadius: "2px",
                  cursor: "pointer",
                  fontSize: "0.5rem",
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "1.5px",
                  transition: "all 0.2s",
                }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Panel body */}
      <div
        style={{
          padding: "32px 24px",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        {loadingGenres && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
            }}>
            <div
              style={{
                fontSize: "0.55rem",
                letterSpacing: "4px",
                color: "rgba(0,229,255,0.5)",
                animation: "pulse 1.2s ease infinite",
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase",
              }}>
              ◈ Clasificando géneros con TMDB...
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {GENRE_KEYS.slice(0, 5).map((k) => (
                <div
                  key={k}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: GENRE_CONFIG[k].color,
                    animation: "pulse 1.2s ease infinite",
                    animationDelay: `${GENRE_KEYS.indexOf(k) * 100}ms`,
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {genreError && !loadingGenres && (
          <div
            style={{
              fontSize: "0.6rem",
              color: "rgba(255,80,80,0.7)",
              letterSpacing: "1px",
              fontFamily: "'Space Mono', monospace",
              textAlign: "center",
            }}>
            ⚠ {genreError}
          </div>
        )}

        {!loadingGenres && !genreError && hasData && (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}>
            {chartType === "donut" && <DonutChart genres={genres} />}
            {chartType === "radar" && <RadarChart genres={genres} />}
            {chartType === "bar" && <BarChart genres={genres} />}
            {chartType === "matrix" && <MatrixChart genres={genres} />}
            {chartType === "gauges" && <GaugesChart genres={genres} />}
            {/* <-- NUEVO RENDER */}
          </div>
        )}

        {!loadingGenres && !genreError && !hasData && (
          <div
            style={{
              fontSize: "0.55rem",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "2px",
              fontFamily: "'Space Mono', monospace",
            }}>
            Sin datos de géneros disponibles
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Directors Panel (Múltiples Vistas)
// ─────────────────────────────────────────────
function DirectorsPanel({ directors, loading }) {
  const [viewMode, setViewMode] = useState("cards")

  const topDirectors = Object.entries(directors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const hasData = topDirectors.length > 0
  const rankColors = ["#00e5ff", "#c084fc", "#facc15", "#4ade80", "#ff4444"]

  // VISTA 1: Tarjetas Originales
  const DirectorCards = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {topDirectors.map(([name, count], i) => (
        <div
          key={name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            background: "rgba(0,0,0,0.3)",
            padding: "12px 20px",
            borderRadius: "4px",
            borderLeft: `2px solid ${rankColors[i] || rankColors[0]}`,
            animation: "fadeSlideIn 0.4s ease both",
            animationDelay: `${i * 100}ms`,
          }}>
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.8rem",
              color: "rgba(255,255,255,0.15)",
              lineHeight: 1,
            }}>
            0{i + 1}
          </span>
          <span
            style={{
              flex: 1,
              color: "#DBD5CA",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}>
            {name}
          </span>
          <span
            style={{
              fontSize: "0.6rem",
              color: rankColors[i] || rankColors[0],
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "1px",
              background: `${rankColors[i] || rankColors[0]}15`,
              padding: "4px 8px",
              borderRadius: "2px",
            }}>
            {count} FILM{count !== 1 ? "S" : ""}
          </span>
        </div>
      ))}
    </div>
  )

  // VISTA 2: Holograma (Barras Verticales Neón)
  const DirectorHologram = () => {
    const max = Math.max(...topDirectors.map((d) => d[1]), 1)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "flex-end",
          height: "200px",
          padding: "20px 0",
        }}>
        {topDirectors.map(([name, count], i) => {
          const color = rankColors[i] || rankColors[0]
          const heightPct = (count / max) * 100

          return (
            <div
              key={name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                width: "60px",
                animation: "fadeSlideIn 0.6s ease both",
                animationDelay: `${i * 80}ms`,
              }}>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: color,
                  textShadow: `0 0 10px ${color}`,
                }}>
                {count}
              </div>
              <div
                style={{
                  width: "30px",
                  height: `${Math.max(heightPct, 15)}px`, // Altura mínima para que siempre se vea
                  background: `linear-gradient(to top, transparent, ${color}90)`,
                  borderTop: `3px solid ${color}`,
                  boxShadow: `0 -10px 20px ${color}60`,
                  borderRadius: "2px 2px 0 0",
                  position: "relative",
                }}>
                {/* Detalle interno cibernético */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "1px",
                    height: "100%",
                    background: "rgba(255,255,255,0.3)",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "0.55rem",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "1px",
                  height: "30px",
                }}>
                {name.split(" ").map((word, idx) => (
                  <div key={idx}>{word}</div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // VISTA 3: Órbita Solar
  const DirectorOrbit = () => {
    const cx = 150,
      cy = 150
    // Radios de órbita crecientes (el #1 está más cerca del centro)
    const radii = [40, 70, 100, 130, 160]

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "10px",
        }}>
        <svg
          viewBox="0 0 300 300"
          style={{ width: "100%", maxWidth: "280px", overflow: "visible" }}>
          {/* Núcleo del Usuario */}
          <circle cx={cx} cy={cy} r={8} fill="#ffffff" opacity={0.8} />
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            fontSize="6"
            fontFamily="'Space Mono', monospace"
            fill="#000"
            fontWeight="bold">
            TÚ
          </text>

          {topDirectors.map(([name, count], i) => {
            const color = rankColors[i] || rankColors[0]
            const r = radii[i]
            // Ángulos distribuidos para que no se encimen
            const angleDeg = i * 72 - 90
            const angleRad = (angleDeg * Math.PI) / 180
            const x = cx + r * Math.cos(angleRad)
            const y = cy + r * Math.sin(angleRad)

            return (
              <g
                key={name}
                style={{
                  animation: "fadeSlideIn 1s ease both",
                  animationDelay: `${i * 150}ms`,
                }}>
                {/* Anillo de la órbita */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />

                {/* Planeta/Nodo del Director */}
                <circle
                  cx={x}
                  cy={y}
                  r={count * 2 + 4}
                  fill={color}
                  opacity={0.8}
                  filter={`drop-shadow(0 0 5px ${color})`}
                />

                {/* Nombre y datos */}
                <text
                  x={x + (x > cx ? 12 : -12)}
                  y={y}
                  textAnchor={x > cx ? "start" : "end"}
                  dominantBaseline="middle"
                  fontSize="8"
                  fill="#F0EDE5"
                  fontFamily="'Space Mono', monospace"
                  letterSpacing="0.5">
                  {name}
                </text>
                <text
                  x={x + (x > cx ? 12 : -12)}
                  y={y + 10}
                  textAnchor={x > cx ? "start" : "end"}
                  fontSize="6"
                  fill={color}
                  fontFamily="'Space Mono', monospace">
                  {count} FILMS
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div
      style={{
        margin: "0 40px 40px",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "4px",
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}>
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "2rem",
            letterSpacing: "2px",
            color: "#F0EDE5",
            lineHeight: 1,
          }}>
          TOP DIRECTORES
        </div>

        {/* Chart type toggle */}
        {hasData && !loading && (
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "rgba(0,0,0,0.3)",
              borderRadius: "3px",
              padding: "3px",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
            {[
              { key: "cards", label: "≡ LISTA" },
              { key: "hologram", label: "◫ HOLOGRAMA" },
              { key: "orbit", label: "◎ ÓRBITA" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                style={{
                  background:
                    viewMode === key ? "rgba(192,132,252,0.15)" : "transparent",
                  border:
                    viewMode === key
                      ? "1px solid rgba(192,132,252,0.35)"
                      : "1px solid transparent",
                  color: viewMode === key ? "#c084fc" : "rgba(255,255,255,0.3)",
                  padding: "5px 12px",
                  borderRadius: "2px",
                  cursor: "pointer",
                  fontSize: "0.5rem",
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "1.5px",
                  transition: "all 0.2s",
                }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "24px", minHeight: "220px" }}>
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px 0",
            }}>
            <div
              style={{
                fontSize: "0.55rem",
                letterSpacing: "4px",
                color: "rgba(0,229,255,0.5)",
                animation: "pulse 1.2s ease infinite",
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase",
              }}>
              ◈ Analizando directores...
            </div>
          </div>
        )}

        {!loading && hasData && (
          <>
            {viewMode === "cards" && <DirectorCards />}
            {viewMode === "hologram" && <DirectorHologram />}
            {viewMode === "orbit" && <DirectorOrbit />}
          </>
        )}

        {!loading && !hasData && (
          <div
            style={{
              textAlign: "center",
              fontSize: "0.55rem",
              color: "rgba(255,255,255,0.2)",
              marginTop: "20px",
              fontFamily: "'Space Mono', monospace",
            }}>
            Sin datos de directores disponibles
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Actors Panel (Múltiples Vistas)
// ─────────────────────────────────────────────
function ActorsPanel({ actors, loading }) {
  const [viewMode, setViewMode] = useState("grid")

  // Tomamos el Top 9 de actores
  const topActors = Object.entries(actors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)

  const hasData = topActors.length > 0

  // Paleta de colores neón para el reparto
  const rankColors = [
    "#4ade80",
    "#f472b6",
    "#00e5ff",
    "#c084fc",
    "#facc15",
    "#fb7185",
    "#2ecc71",
    "#3498db",
    "#9b59b6",
  ]

  // VISTA 1: Grilla de Reparto (Original)
  const ActorsGrid = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "12px",
      }}>
      {topActors.map(([name, count], i) => {
        const color = rankColors[i] || rankColors[0]
        return (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderBottom: `2px solid ${color}`,
              padding: "12px 16px",
              borderRadius: "4px",
              animation: "fadeSlideIn 0.3s ease both",
              animationDelay: `${i * 50}ms`,
            }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: `${color}15`,
                border: `1px solid ${color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                marginRight: "12px",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1rem",
                color: color,
              }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "#DBD5CA",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                {name}
              </div>
              <div
                style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.4)" }}>
                {count} CRÉDITOS DETECTADOS
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  // VISTA 2: Espectro de Actuación (Holograma Vertical)
  const ActorsSpectrum = () => {
    const max = Math.max(...topActors.map((a) => a[1]), 1)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          height: "200px",
          padding: "10px 0",
          gap: "8px",
        }}>
        {topActors.map(([name, count], i) => {
          const color = rankColors[i] || rankColors[0]
          const heightPct = (count / max) * 100
          return (
            <div
              key={name}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                animation: "fadeSlideIn 0.5s ease both",
                animationDelay: `${i * 40}ms`,
              }}>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontFamily: "'Space Mono', monospace",
                  color: color,
                  fontWeight: "bold",
                }}>
                {count}
              </div>
              <div
                style={{
                  width: "100%",
                  maxWidth: "20px",
                  height: `${heightPct}%`,
                  background: `linear-gradient(to top, ${color}20, ${color})`,
                  boxShadow: `0 0 15px ${color}40`,
                  borderRadius: "1px",
                  position: "relative",
                }}>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: "#fff",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "0.45rem",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.5)",
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  height: "60px",
                  letterSpacing: "1px",
                }}>
                {name.toUpperCase()}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // VISTA 3: Constelación de Estrellas (Mapa Radial)
  const ActorsConstellation = () => {
    const cx = 150,
      cy = 120
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg
          viewBox="0 0 300 240"
          style={{ width: "100%", maxWidth: "350px", overflow: "visible" }}>
          {topActors.map(([name, count], i) => {
            const color = rankColors[i] || rankColors[0]
            const angle = i * (360 / topActors.length) * (Math.PI / 180)
            const dist = 90 - i * 5 // Los más vistos están más cerca del centro
            const x = cx + dist * Math.cos(angle)
            const y = cy + dist * Math.sin(angle)

            return (
              <g
                key={name}
                style={{
                  animation: "fadeSlideIn 0.8s ease both",
                  animationDelay: `${i * 100}ms`,
                }}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke={color}
                  strokeWidth="0.5"
                  opacity="0.2"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={count + 3}
                  fill={color}
                  filter={`drop-shadow(0 0 4px ${color})`}>
                  <animate
                    attributeName="opacity"
                    values="0.4;0.9;0.4"
                    dur={`${2 + i}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                <text
                  x={x}
                  y={y - (count + 8)}
                  textAnchor="middle"
                  fontSize="7"
                  fill="#F0EDE5"
                  fontFamily="'Space Mono', monospace"
                  opacity="0.8">
                  {name.split(" ").pop()}
                </text>
              </g>
            )
          })}
          <circle
            cx={cx}
            cy={cy}
            r={3}
            fill="#fff"
            filter="drop-shadow(0 0 6px #fff)"
          />
        </svg>
      </div>
    )
  }

  return (
    <div
      style={{
        margin: "0 40px 40px",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "4px",
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}>
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "2rem",
            letterSpacing: "2px",
            color: "#F0EDE5",
            lineHeight: 1,
          }}>
          TOP REPARTO
        </div>

        {hasData && !loading && (
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "rgba(0,0,0,0.3)",
              borderRadius: "3px",
              padding: "3px",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
            {[
              { key: "grid", label: "▦ GRILLA" },
              { key: "spectrum", label: "▤ ESPECTRO" },
              { key: "constellation", label: "✨ MAPA" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                style={{
                  background:
                    viewMode === key ? "rgba(74,222,128,0.15)" : "transparent",
                  border:
                    viewMode === key
                      ? "1px solid rgba(74,222,128,0.35)"
                      : "1px solid transparent",
                  color: viewMode === key ? "#4ade80" : "rgba(255,255,255,0.3)",
                  padding: "5px 12px",
                  borderRadius: "2px",
                  cursor: "pointer",
                  fontSize: "0.5rem",
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "1.5px",
                  transition: "all 0.2s",
                }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "24px", minHeight: "200px" }}>
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px",
            }}>
            <div
              style={{
                fontSize: "0.55rem",
                letterSpacing: "4px",
                color: "rgba(74,222,128,0.5)",
                animation: "pulse 1.2s ease infinite",
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase",
              }}>
              Explorando apariciones...
            </div>
          </div>
        )}

        {!loading && hasData && (
          <>
            {viewMode === "grid" && <ActorsGrid />}
            {viewMode === "spectrum" && <ActorsSpectrum />}
            {viewMode === "constellation" && <ActorsConstellation />}
          </>
        )}

        {!loading && !hasData && (
          <div
            style={{
              textAlign: "center",
              fontSize: "0.55rem",
              color: "rgba(255,255,255,0.2)",
              marginTop: "20px",
              fontFamily: "'Space Mono', monospace",
            }}>
            Sin datos de reparto disponibles
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Countries Panel (Geolocalización con Banderas)
// ─────────────────────────────────────────────
function CountriesPanel({ countries, loading }) {
  const [viewMode, setViewMode] = useState("list")

  // Diccionario interno para traducir códigos ISO de 2 letras
  const ISO_COUNTRY_NAMES = {
    US: "Estados Unidos",
    GB: "Reino Unido",
    JP: "Japón",
    KR: "Corea del Sur",
    MX: "México",
    FR: "Francia",
    ES: "España",
    IT: "Italia",
    DE: "Alemania",
    CA: "Canadá",
    IN: "India",
    AR: "Argentina",
    BR: "Brasil",
    AU: "Australia",
    CN: "China",
    RU: "Rusia",
    SE: "Suecia",
    DK: "Dinamarca",
    IE: "Irlanda",
    NZ: "Nueva Zelanda",
    PL: "Polonia",
    IR: "Irán",
    NL: "Países Bajos",
    BE: "Bélgica",
  }

  // Tomamos el Top 6 de códigos de país
  const topCountryCodes = Object.entries(countries || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const hasData = topCountryCodes.length > 0
  const themeColor = "#ff8c00" // Ámbar/Naranja cibernético

  // Función auxiliar para generar la URL de la bandera desde Flagpedia CDN
  const getFlagUrl = (code) => {
    if (!code || code === "UNKNOWN") return null
    // Flagpedia usa códigos en minúscula
    return `https://flagcdn.com/w80/${code.toLowerCase()}.png`
  }

  // VISTA 1: Lista Datalog
  const CountryList = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {topCountryCodes.map(([code, count], i) => {
        const flagUrl = getFlagUrl(code)
        const fullName = ISO_COUNTRY_NAMES[code] || `Código: ${code}`

        return (
          <div
            key={code}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "rgba(0,0,0,0.4)",
              padding: "12px 20px",
              borderRadius: "4px",
              borderLeft: `2px solid ${themeColor}`,
              animation: "fadeSlideIn 0.3s ease both",
              animationDelay: `${i * 60}ms`,
            }}>
            {/* Imagen de la Bandera */}
            <div
              style={{
                width: "40px",
                height: "30px",
                flexShrink: 0,
                borderRadius: "2px",
                overflow: "hidden",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
              {flagUrl ? (
                <img
                  src={flagUrl}
                  alt={fullName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                  }}>
                  📍
                </div>
              )}
            </div>

            <span
              style={{
                flex: 1,
                color: "#DBD5CA",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
              {fullName}
            </span>
            <span
              style={{
                fontSize: "0.6rem",
                color: themeColor,
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "1px",
                background: `${themeColor}15`,
                padding: "4px 8px",
                borderRadius: "2px",
              }}>
              {count} FILM{count !== 1 ? "S" : ""}
            </span>
          </div>
        )
      })}
    </div>
  )

  // VISTA 2: Nodos de Sectores
  const CountryNodes = () => {
    const max = Math.max(...topCountryCodes.map((c) => c[1]), 1)
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "16px",
        }}>
        {topCountryCodes.map(([code, count], i) => {
          const pct = (count / max) * 100
          const flagUrl = getFlagUrl(code)
          const fullName = ISO_COUNTRY_NAMES[code] || code

          return (
            <div
              key={code}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                padding: "16px",
                borderRadius: "4px",
                position: "relative",
                overflow: "hidden",
                animation: "fadeSlideIn 0.4s ease both",
                animationDelay: `${i * 50}ms`,
              }}>
              {/* Barra de progreso de fondo */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: "3px",
                  width: `${pct}%`,
                  background: themeColor,
                  boxShadow: `0 0 10px ${themeColor}`,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontFamily: "'Bebas Neue', sans-serif",
                    color: themeColor,
                    lineHeight: 1,
                  }}>
                  {count}
                </div>
                {/* Bandera pequeña */}
                <div
                  style={{
                    width: "30px",
                    height: "20px",
                    borderRadius: "2px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                  <img
                    src={flagUrl}
                    alt={fullName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  fontSize: "0.65rem",
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  marginTop: "4px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                {fullName}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      style={{
        margin: "0 40px 40px",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "4px",
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}>
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "2rem",
            letterSpacing: "2px",
            color: "#F0EDE5",
            lineHeight: 1,
          }}>
          TOP PAÍSES
        </div>
        {hasData && !loading && (
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "rgba(0,0,0,0.3)",
              borderRadius: "3px",
              padding: "3px",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
            {[
              { key: "list", label: "≡ DATALOG" },
              { key: "nodes", label: "◰ SECTORES" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                style={{
                  background:
                    viewMode === key ? `${themeColor}20` : "transparent",
                  border:
                    viewMode === key
                      ? `1px solid ${themeColor}50`
                      : "1px solid transparent",
                  color:
                    viewMode === key ? themeColor : "rgba(255,255,255,0.3)",
                  padding: "5px 12px",
                  borderRadius: "2px",
                  cursor: "pointer",
                  fontSize: "0.5rem",
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "1.5px",
                  transition: "all 0.2s",
                }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "24px", minHeight: "150px" }}>
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}>
            <div
              style={{
                fontSize: "0.55rem",
                letterSpacing: "4px",
                color: `${themeColor}80`,
                animation: "pulse 1.2s ease infinite",
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase",
              }}>
              ◈ Rastreando señales satelitales...
            </div>
          </div>
        )}
        {!loading && hasData && (
          <>
            {viewMode === "list" && <CountryList />}
            {viewMode === "nodes" && <CountryNodes />}
          </>
        )}
        {!loading && !hasData && (
          <div
            style={{
              textAlign: "center",
              fontSize: "0.55rem",
              color: "rgba(255,255,255,0.2)",
              marginTop: "20px",
              fontFamily: "'Space Mono', monospace",
            }}>
            Sin datos de origen disponibles
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Quiz Modal (Calificaciones y Años de estreno)
// ─────────────────────────────────────────────
function QuizModal({ movies, onClose }) {
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selected, setSelected] = useState(null)

  // Generar las preguntas al abrir el modal
  useEffect(() => {
    // Tomamos hasta 5 películas al azar
    const shuffled = [...movies].sort(() => 0.5 - Math.random())
    const selectedMovies = shuffled.slice(0, 5)

    const possibleRatings = [
      "0.5",
      "1",
      "1.5",
      "2",
      "2.5",
      "3",
      "3.5",
      "4",
      "4.5",
      "5",
      "Sin calificar",
    ]

    const generated = selectedMovies.map((movie) => {
      // 50% probabilidad de preguntar el Año (siempre y cuando la película tenga año)
      const isYear = Math.random() > 0.5 && Boolean(movie.year)

      let qText = ""
      let correct = ""
      let options = []

      if (isYear) {
        qText = `¿En qué año se estrenó "${movie.title}"?`
        correct = movie.year
        options = [correct]

        // Generar años falsos cercanos al real
        while (options.length < 4) {
          const fakeYear = (
            parseInt(correct) +
            (Math.floor(Math.random() * 11) - 5)
          ).toString()
          if (!options.includes(fakeYear)) options.push(fakeYear)
        }
      } else {
        qText = `¿Qué calificación le diste a "${movie.title}"?`
        correct = movie.rating ? `${movie.rating}` : "Sin calificar"
        options = [correct]

        // Generar calificaciones falsas realistas
        while (options.length < 4) {
          const fakeRating =
            possibleRatings[Math.floor(Math.random() * possibleRatings.length)]
          if (!options.includes(fakeRating)) options.push(fakeRating)
        }
      }

      // Desordenar las opciones
      options = options.sort(() => 0.5 - Math.random())

      return { movie, qText, options, correct, isYear }
    })

    setQuestions(generated)
  }, [movies])

  const handleAnswer = (option) => {
    if (selected !== null) return // Evitar doble clic
    setSelected(option)

    if (option === questions[currentQ].correct) {
      setScore((s) => s + 1)
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ((c) => c + 1)
        setSelected(null)
      } else {
        setShowResult(true)
      }
    }, 1200) // Esperar un poco para ver el feedback de colores
  }

  if (questions.length === 0) return null

  const current = questions[currentQ]

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(10,10,10,0.9)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Space Mono', monospace",
      }}>
      <div
        style={{
          background: "#121212",
          border: "1px solid rgba(0,229,255,0.3)",
          boxShadow: "0 0 30px rgba(0,229,255,0.1)",
          borderRadius: "4px",
          width: "100%",
          maxWidth: "500px",
          overflow: "hidden",
          position: "relative",
        }}>
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: "1.2rem",
            cursor: "pointer",
            zIndex: 10,
          }}>
          ✕
        </button>

        {showResult ? (
          <div style={{ padding: "50px", textAlign: "center" }}>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "3rem",
                color: "#00e5ff",
                margin: 0,
              }}>
              TEST COMPLETADO
            </h2>
            <div
              style={{ fontSize: "1rem", color: "#DBD5CA", margin: "20px 0" }}>
              Puntuación:{" "}
              <span style={{ color: "#facc15", fontWeight: "bold" }}>
                {score}
              </span>{" "}
              / {questions.length}
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(0,229,255,0.1)",
                border: "1px solid #00e5ff",
                color: "#00e5ff",
                padding: "10px 20px",
                cursor: "pointer",
                textTransform: "uppercase",
              }}>
              Cerrar Terminal
            </button>
          </div>
        ) : (
          <div>
            {/* Header del Quiz */}
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                color: "#00e5ff",
                fontSize: "0.7rem",
              }}>
              <span>SYSTEM.TRIVIA_MODULE</span>
              <span>
                PREGUNTA {currentQ + 1} / {questions.length}
              </span>
            </div>

            <div style={{ padding: "30px" }}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "1.1rem",
                    color: "#F0EDE5",
                    marginBottom: "20px",
                    lineHeight: "1.4",
                  }}>
                  {current.qText}
                </div>
              </div>

              {/* Opciones */}
              <div style={{ display: "grid", gap: "12px" }}>
                {current.options.map((opt, i) => {
                  let bgColor = "rgba(255,255,255,0.03)"
                  let borderColor = "rgba(255,255,255,0.1)"
                  let textColor = "#DBD5CA"

                  if (selected) {
                    if (opt === current.correct) {
                      bgColor = "rgba(74,222,128,0.15)"
                      borderColor = "#4ade80"
                      textColor = "#4ade80"
                    } else if (
                      opt === selected &&
                      selected !== current.correct
                    ) {
                      bgColor = "rgba(255,68,68,0.15)"
                      borderColor = "#ff4444"
                      textColor = "#ff4444"
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={selected !== null}
                      onClick={() => handleAnswer(opt)}
                      style={{
                        background: bgColor,
                        border: `1px solid ${borderColor}`,
                        color: textColor,
                        padding: "14px",
                        borderRadius: "3px",
                        cursor: selected ? "default" : "pointer",
                        fontSize: "0.85rem",
                        fontFamily: "'Space Mono', monospace",
                        transition: "all 0.2s",
                      }}>
                      {opt}{" "}
                      {opt !== "Sin calificar" && !current.isYear ? "⭐" : ""}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// StarRating
// ─────────────────────────────────────────────
function StarRating({ rating }) {
  if (!rating) return null
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push("★")
    else if (rating >= i - 0.5) stars.push("½")
    else stars.push("☆")
  }
  return (
    <span
      style={{ color: "#00e5ff", fontSize: "0.7rem", letterSpacing: "1px" }}>
      {stars.join("")}
    </span>
  )
}

// ─────────────────────────────────────────────
// Bento patterns
// ─────────────────────────────────────────────
const BENTO_PATTERNS = [
  [1, 3, 1, 2, 1, 2, 3, 1, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1],
  [3, 1, 2, 1, 1, 2, 1, 3, 2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 2, 3, 1, 1, 2, 1, 3],
  [2, 2, 3, 1, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 1, 2],
  [1, 1, 2, 3, 1, 3, 1, 1, 2, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 1, 1],
  [3, 2, 1, 1, 2, 1, 1, 3, 1, 2, 1, 2, 3, 1, 1, 3, 1, 2, 1, 1, 2, 1, 1, 3, 2],
  [1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 3, 1, 1, 2, 1, 2, 1, 3, 1, 3, 1, 2, 1, 1],
  [2, 3, 1, 1, 2, 3, 1, 2, 1, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 1, 2, 3],
  [1, 1, 3, 2, 1, 2, 1, 1, 3, 2, 1, 3, 2, 1, 1, 2, 3, 1, 1, 2, 1, 2, 1, 3, 1],
  [3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 2, 1, 1, 2],
  [2, 1, 3, 1, 2, 1, 2, 3, 1, 1, 3, 1, 2, 1, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 1],
]

// ─────────────────────────────────────────────
// MovieCard
// ─────────────────────────────────────────────
function MovieCard({ movie, size, index }) {
  const [hovered, setHovered] = useState(false)

  const SIZES = {
    1: { gridColumn: "span 1", gridRow: "span 1" },
    2: { gridColumn: "span 2", gridRow: "span 1" },
    3: { gridColumn: "span 2", gridRow: "span 2" },
  }

  return (
    // Card container
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...SIZES[size],
        position: "relative",
        overflow: "hidden",
        borderRadius: "4px",
        cursor: "pointer",
        border: hovered
          ? "1px solid rgba(0,229,255,0.5)"
          : "1px solid rgba(255,255,255,0.06)",
        transition:
          "border 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
        transform: hovered ? "scale(1.015)" : "scale(1)",
        boxShadow: hovered ? "0 0 30px rgba(0,229,255,0.15)" : "none",
        animation: `fadeSlideIn 0.5s ease both`,
        animationDelay: `${index * 60}ms`,
        background: "#0a0a0a",
      }}
      onClick={() => window.open(movie.link, "_blank")}>
      {/* Image */}
      {movie.poster ? (
        <img
          src={movie.poster}
          alt={movie.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.5s ease, filter 0.3s ease",
            transform: hovered ? "scale(1.07)" : "scale(1)",
            filter: hovered ? "brightness(0.45)" : "brightness(0.75)",
          }}
        />
      ) : (
        <div
          // Placeholder para películas sin poster
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.85) 25%, rgba(10,10,10,0.3) 55%, transparent 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.15)",
            fontSize: "2rem",
          }}>
          🎬
        </div>
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background:
            "linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.85) 25%, rgba(10,10,10,0.3) 55%, transparent 100%)",
          transition: "opacity 0.3s",
          opacity: hovered ? 1 : size === 1 ? 0.9 : 0.7,
          pointerEvents: "none",
        }}
      />

      {/* Info */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          padding: size === 3 ? "16px 14px" : "10px 10px",
          paddingBottom: hovered
            ? size === 3
              ? "16px"
              : "10px"
            : size === 3
              ? "14px"
              : "8px",
          transition: "padding-bottom 0.3s ease",
        }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: size === 3 ? "1.8rem" : size === 2 ? "1.25rem" : "1rem",
            color: "#F0EDE5",
            lineHeight: 1.1,
            letterSpacing: "0.5px",
            marginBottom: "3px",
            textShadow: "0 1px 8px rgba(0,0,0,0.8)",
          }}>
          {movie.title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}>
          {movie.year && (
            <span
              style={{
                fontSize: "0.6rem",
                color: "rgba(255,255,255,0.4)",
                fontFamily: "'Space Mono', monospace",
              }}>
              {movie.year}
            </span>
          )}
          <StarRating rating={movie.rating} />
        </div>

        {hovered && size >= 2 && (
          <div
            style={{
              marginTop: "5px",
              fontSize: "0.55rem",
              color: "rgba(0,229,255,0.6)",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}>
            Ver en Letterboxd →
          </div>
        )}
      </div>

      {/* Index badge */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          zIndex: 10,
          width: "25px",
          height: "25px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(0,229,255,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.5rem",
          color: "rgba(0,229,255,0.7)",
          fontFamily: "'Space Mono', monospace",
          backdropFilter: "blur(4px)",
        }}>
        {String(index + 1).padStart(2, "0")}
      </div>
    </div>
  )
}

function RecentProfiles({ profiles, onSelect }) {
  if (profiles.length === 0) return null

  return (
    <div style={{ marginTop: "40px", animation: "fadeSlideIn 0.8s ease both" }}>
      <div
        style={{
          fontSize: "0.55rem",
          letterSpacing: "3px",
          color: "rgba(255,255,255,0.2)",
          textTransform: "uppercase",
          marginBottom: "16px",
        }}>
        Perfiles recientes
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        {profiles.map((profile) => (
          <button
            key={profile}
            onClick={() => onSelect(profile)}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#DBD5CA",
              padding: "8px 16px",
              borderRadius: "3px",
              fontSize: "0.7rem",
              fontFamily: "'Space Mono', monospace",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)"
              e.currentTarget.style.background = "rgba(0,229,255,0.05)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
              e.currentTarget.style.background = "rgba(255,255,255,0.03)"
            }}>
            @{profile}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
export default function App() {
  const [url, setUrl] = useState("")
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [username, setUsername] = useState(null)
  // Vista de películas
  const [movieViewMode, setMovieViewMode] = useState("bento")
  // Perfiles recientes
  const [recentProfiles, setRecentProfiles] = useState([])
  // High and low de años para el quiz
  const [showHighLowGame, setShowHighLowGame] = useState(false)

  // Cargar perfiles guardados al montar el componente
  useEffect(() => {
    const saved = localStorage.getItem("letterboxd_recent_profiles")
    if (saved) {
      setRecentProfiles(JSON.parse(saved))
    }
  }, [])

  // Genre, Director, Actor, Countries and Platforms state
  const [genres, setGenres] = useState({})
  const [directors, setDirectors] = useState({})
  const [actors, setActors] = useState({})
  const [countries, setCountries] = useState({})
  const [platforms, setPlatforms] = useState({})
  const [loadingGenres, setLoadingGenres] = useState(false)
  const [genreError, setGenreError] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)

  const fetchMovies = useCallback(async () => {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setMovies([])
    setGenres({})
    setGenreError(null)

    try {
      let user = url.trim()
      const match = user.match(/letterboxd\.com\/([^/]+)/)
      if (match) user = match[1]
      else user = user.replace(/^@/, "")

      setUsername(user)

      // Guardar en perfiles recientes
      setRecentProfiles((prev) => {
        // Filtramos para que no se repita y agregamos el nuevo al inicio
        const updated = [user, ...prev.filter((p) => p !== user)].slice(0, 3)
        localStorage.setItem(
          "letterboxd_recent_profiles",
          JSON.stringify(updated),
        )
        return updated
      })

      const rssUrl = `/api/rss-proxy?user=${user}`
      const res = await fetch(rssUrl)
      if (!res.ok)
        throw new Error(
          "No se pudo obtener el feed. Verifica el usuario o tu conexión.",
        )
      const xmlText = await res.text()
      const parser = new DOMParser()
      const xml = parser.parseFromString(xmlText, "text/xml")
      const items = Array.from(xml.querySelectorAll("item")).slice(0, 15)

      if (items.length === 0)
        throw new Error("No se encontraron películas. Verifica el usuario.")

      const parsed = items.map((item) => {
        // Guardamos el título crudo entero para buscar las estrellas
        const rawTitleNode = item.querySelector("title")?.textContent || ""

        const title =
          item.querySelector("filmTitle")?.textContent ||
          rawTitleNode.split(",")[0] ||
          "Unknown"

        const link = item.querySelector("link")?.textContent || "#"
        const description = item.querySelector("description")?.textContent || ""

        // 1. Intento A: Buscar la etiqueta nativa (usando métodos seguros para namespaces)
        const ratingNode =
          item.getElementsByTagNameNS(
            "https://letterboxd.com",
            "memberRating",
          )[0] || item.getElementsByTagName("letterboxd:memberRating")[0]

        let movieRating = ratingNode ? parseFloat(ratingNode.textContent) : null

        // 2. Intento B: Si el navegador ignoró la etiqueta, leemos las estrellas directo del <title>
        if (!movieRating) {
          const starMatch = rawTitleNode.match(/ - ([★½]+)$/)
          if (starMatch) {
            const starsText = starMatch[1]
            const full = (starsText.match(/★/g) || []).length
            const half = starsText.includes("½") ? 0.5 : 0
            movieRating = full + half
          }
        }

        // 3. Intento C: Fallback original en la descripción (por si es un formato muy antiguo)
        if (!movieRating) {
          movieRating = extractRating(description)
        }

        const yearNode =
          item.getElementsByTagNameNS(
            "https://letterboxd.com",
            "filmYear",
          )[0] || item.getElementsByTagName("letterboxd:filmYear")[0]

        return {
          title,
          link,
          poster: extractPoster(description),
          rating: movieRating,
          year: yearNode ? yearNode.textContent : null,
        }
      })

      setMovies(parsed)

      // Fetch genres asynchronously after movies are set
      setLoadingGenres(true)
      try {
        const titles = parsed.map((m) => m.title)
        const metadata = await fetchMetadataFromTMDB(titles)

        // Actualizamos las películas agregándoles sus plataformas
        setMovies((prev) =>
          prev.map((m) => {
            const meta = metadata.rawResults.find(
              (r) => r && r.title === m.title,
            )
            return { 
              ...m, 
              platforms: meta?.platforms || [], 
              metrics: {
                rating: meta?.globalRating ? parseFloat(meta.globalRating) : 0, 
                popularity: meta?.popularity || 0,
                year: meta?.releaseDate ? parseInt(meta.releaseDate.split("-")[0]) : 0,
              }}
          }),
        )

        setGenres(metadata.genres)
        setDirectors(metadata.directors)
        setActors(metadata.actors)
        setCountries(metadata.countries)
        setPlatforms(metadata.platforms)
      } catch (ge) {
        setGenreError(
          "No se pudieron clasificar los géneros: " +
            (ge.message || "Error inesperado"),
        )
      } finally {
        setLoadingGenres(false)
      }
    } catch (e) {
      setError(e.message || "Error inesperado")
    } finally {
      setLoading(false)
    }
  }, [url])

  const resetToStart = useCallback(() => {
    setUrl("")
    setMovies([])
    setUsername(null)
    setGenres({})
    setDirectors({})
    setActors({})
    setError(null)
    setGenreError(null)
    setLoading(false)
    setLoadingGenres(false)
    setShowQuiz(false)
    setCountries({})
    setPlatforms({})
  }, [])

  const pattern = useMemo(
    () => BENTO_PATTERNS[Math.floor(Math.random() * BENTO_PATTERNS.length)],
    [movies],
  )

  const showGenrePanel = movies.length > 0 || loadingGenres

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #111315, #181818)",
        color: "#DBD5CA",
        fontFamily: "'Space Mono', monospace",
        padding: "0",
      }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(0,229,255,0.3); }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { outline: none; border-color: rgba(19,63,67,0.5) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.3); border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "48px 40px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)",
          }}
        />

        {/* Al hacer clic en el título también se reinicia, como es estándar */}
        <h1
          onClick={resetToStart}
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            letterSpacing: "2px",
            lineHeight: 1,
            margin: 0,
            cursor: "pointer",
            background:
              "linear-gradient(135deg, #f8f9fa 0%, rgba(255,255,255,0.5) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
          BENTOBOXD
        </h1>

        {/* Botones de acción (solo visibles si hay películas cargadas) */}
        {movies.length > 0 && (
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setShowQuiz(true)}
              style={{
                background: "rgba(0,229,255,0.05)",
                border: "1px solid rgba(0,229,255,0.3)",
                color: "#00e5ff",
                padding: "10px 20px",
                borderRadius: "3px",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.5rem",
                letterSpacing: "2px",
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "all 0.2s",
                width: "160px",
                textAlign: "center",
              }}>
              Quiz
            </button>
            {/* NUEVO BOTÓN: HIGH OR LOW */}
            <button
              onClick={() => setShowHighLowGame(true)}
              style={{
                background: "rgba(250,204,21,0.05)",
                border: "1px solid rgba(250,204,21,0.3)",
                color: "#facc15",
                padding: "10px 20px",
                borderRadius: "3px",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.5rem",
                letterSpacing: "2px",
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "all 0.2s",
                width: "160px",
                textAlign: "center",
              }}>
              High or Low
            </button>
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchMovies()}
          placeholder="letterboxd.com/username o solo el username"
          style={{
            flex: 1,
            minWidth: "260px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "3px",
            padding: "12px 16px",
            color: "#E5E5E5",
            fontSize: "0.75rem",
            fontFamily: "'Space Mono', monospace",
            transition: "border 0.2s",
          }}
        />

        <button
          onClick={fetchMovies}
          disabled={loading}
          style={{
            background: loading
              ? "rgba(0,229,255,0.1)"
              : "rgba(0,229,255,0.12)",
            border: "1px solid rgba(0,229,255,0.4)",
            color: loading ? "rgba(0,229,255,0.4)" : "#00e5ff",
            padding: "12px 28px",
            borderRadius: "3px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "0.7rem",
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "2px",
            textTransform: "uppercase",
            transition: "all 0.2s",
            width: "160px",
            textAlign: "center",
          }}>
          {loading ? "Cargando..." : "Generar"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            margin: "24px 40px",
            padding: "14px 20px",
            border: "1px solid rgba(255,80,80,0.3)",
            borderRadius: "3px",
            background: "rgba(255,80,80,0.05)",
            color: "rgba(255,80,80,0.8)",
            fontSize: "0.7rem",
            letterSpacing: "1px",
          }}>
          ⚠ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: "48px 40px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.6rem",
              letterSpacing: "4px",
              color: "rgba(0,229,255,0.5)",
              animation: "pulse 1.2s ease infinite",
            }}>
            ◈ Obteniendo películas...
          </div>
        </div>
      )}

      {/* Movies Display Area */}
      {movies.length > 0 && (
        <div style={{ padding: "32px 40px 32px" }}>
          {/* Cabecera y Controles de Vista */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "24px",
            }}>
            {username && (
              <div
                style={{
                  fontSize: "0.6rem",
                  letterSpacing: "3px",
                  color: "#fafafa",
                  textTransform: "uppercase",
                }}>
                @{username} — {movies.length} películas recientes
              </div>
            )}

            {/* Toggle de Vistas de Películas */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "3px",
                padding: "3px",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>
              {[
                { key: "bento", label: "▦ BENTO" },
                { key: "timeline", label: "▤ LÍNEA DE TIEMPO" },
                { key: "terminal", label: ">_ TERMINAL" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setMovieViewMode(key)}
                  style={{
                    background:
                      movieViewMode === key
                        ? "rgba(0,229,255,0.15)"
                        : "transparent",
                    border:
                      movieViewMode === key
                        ? "1px solid rgba(0,229,255,0.35)"
                        : "1px solid transparent",
                    color:
                      movieViewMode === key
                        ? "#00e5ff"
                        : "rgba(255,255,255,0.3)",
                    padding: "5px 12px",
                    borderRadius: "2px",
                    cursor: "pointer",
                    fontSize: "0.5rem",
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: "1.5px",
                    transition: "all 0.2s",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* VISTA 1: Bento Grid (Tu código original) */}
          {movieViewMode === "bento" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", // Ajustado para ser más responsivo
                gridAutoRows: "180px",
                gap: "8px",
                gridAutoFlow: "dense",
              }}>
              {movies.map((movie, i) => (
                <MovieCard
                  key={i}
                  movie={movie}
                  size={pattern[i] || 1}
                  index={i}
                />
              ))}
            </div>
          )}

          {/* VISTA 2: Línea de Tiempo */}
          {movieViewMode === "timeline" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {movies.map((movie, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "20px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "12px",
                    borderRadius: "4px",
                    alignItems: "center",
                    animation: "fadeSlideIn 0.4s ease both",
                    animationDelay: `${i * 40}ms`,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onClick={() => window.open(movie.link, "_blank")}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(0,229,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.02)")
                  }>
                  {/* Número */}
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "2rem",
                      color: "rgba(255,255,255,0.1)",
                      width: "40px",
                      textAlign: "center",
                    }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Póster pequeño */}
                  <div
                    style={{
                      width: "50px",
                      height: "75px",
                      flexShrink: 0,
                      background: "#111",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}>
                    {movie.poster ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                        }}>
                        🎬
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "1.8rem",
                        color: "#F0EDE5",
                        letterSpacing: "1px",
                        lineHeight: 1,
                        marginBottom: "4px",
                      }}>
                      {movie.title}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}>
                      {movie.year && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            color: "rgba(255,255,255,0.4)",
                            fontFamily: "'Space Mono', monospace",
                          }}>
                          AÑO: {movie.year}
                        </span>
                      )}
                      <StarRating rating={movie.rating} />
                    </div>
                  </div>

                  {/* Botón ir */}
                  <div
                    style={{
                      color: "#00e5ff",
                      fontSize: "1.2rem",
                      padding: "0 10px",
                      opacity: 0.5,
                    }}>
                    ↗
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VISTA 3: Terminal de Datos */}
          {movieViewMode === "terminal" && (
            <div
              style={{
                background: "#050505",
                border: "1px solid rgba(0,229,255,0.2)",
                padding: "24px",
                borderRadius: "4px",
                fontFamily: "'Space Mono', monospace",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)",
                position: "relative",
                overflow: "hidden",
              }}>
              {/* Scanline effect */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                  backgroundSize: "100% 4px, 3px 100%",
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.65rem",
                  marginBottom: "16px",
                  textTransform: "uppercase",
                }}>
                root@sys:~# ./fetch_logs.sh --user={username} --limit=
                {movies.length}
                <br />
                [OK] CONNECTED TO LETTERBOXD MAINFRAME...
                <br />
                [OK] DOWNLOADING SECURE LOGS...
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {movies.map((movie, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      borderBottom: "1px dashed rgba(0,229,255,0.15)",
                      fontSize: "0.7rem",
                      color: "#00e5ff",
                      animation: "fadeSlideIn 0.1s ease both",
                      animationDelay: `${i * 20}ms`,
                    }}>
                    <span
                      style={{
                        display: "flex",
                        gap: "12px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}>
                      <span style={{ color: "#facc15" }}>
                        [{String(i + 1).padStart(2, "0")}]
                      </span>
                      <span
                        style={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          color: "#DBD5CA",
                        }}>
                        {movie.title}
                      </span>
                    </span>
                    <span
                      style={{ display: "flex", gap: "16px", flexShrink: 0 }}>
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>
                        {movie.year || "----"}
                      </span>
                      <span
                        style={{
                          color: "#4ade80",
                          width: "40px",
                          textAlign: "right",
                        }}>
                        {movie.rating ? `${movie.rating}★` : "NULL"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  color: "#00e5ff",
                  marginTop: "12px",
                  animation: "pulse 1s infinite",
                }}>
                _
              </div>
            </div>
          )}
        </div>
      )}

      {/* Platforms Panel (NUEVO) */}
      {showGenrePanel && (
        <PlatformsPanel
          platformsData={platforms}
          movies={movies}
          loading={loadingGenres}
        />
      )}

      {/* Genre Panel */}
      {showGenrePanel && (
        <GenrePanel
          genres={genres}
          loadingGenres={loadingGenres}
          genreError={genreError}
        />
      )}

      {/* Directors Panel*/}
      {showGenrePanel && (
        <DirectorsPanel
          directors={directors}
          movie={movies[0]}
          loading={loadingGenres}
        />
      )}

      {/* Actors Panel (NUEVO) */}
      {showGenrePanel && (
        <ActorsPanel actors={actors} loading={loadingGenres} />
      )}

      {/* Countries Panel (NUEVO) */}
      {showGenrePanel && (
        <CountriesPanel countries={countries} loading={loadingGenres} />
      )}

      {/* Empty state */}
      {!loading && movies.length === 0 && !error && (
        <div style={{ padding: "30px 40px", textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px", opacity: 0.3 }}>
            🎞
          </div>
          <div
            style={{
              fontSize: "0.6rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#E5E5E5",
              marginBottom: "20px",
            }}>
            Ingresa un usuario de Letterboxd para comenzar
          </div>

          {/* NUEVO: Panel de perfiles recientes */}
          <RecentProfiles
            profiles={recentProfiles}
            onSelect={(user) => {
              setUrl(user)
              // Pequeño timeout para asegurar que el estado de la URL se actualice
              setTimeout(() => fetchMovies(), 10)
            }}
          />
        </div>
      )}

      {/* Renderiza el Juego High or Low a pantalla completa */}
      {showHighLowGame && (
        <HighLowGame movies={movies} onClose={() => setShowHighLowGame(false)} />
      )}

      {/* Renderiza el Modal del Quiz si el estado está activo */}
      {showQuiz && (
        <QuizModal movies={movies} onClose={() => setShowQuiz(false)} />
      )}
    </div>
  )
}
