import { useState, useCallback, useMemo, useEffect } from "react"

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

function extractYear(description) {
  const match = description?.match(/(\d{4})<\/p>/)
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
// TMDB API Metadata fetcher (Géneros, Directores y Actores)
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

  const fetchPromises = movieTitles.map(async (title) => {
    try {
      const cleanTitle = title.split(" - ")[0]

      const searchRes = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&language=es-MX`,
      )
      if (!searchRes.ok) return null
      const searchData = await searchRes.json()

      if (searchData.results && searchData.results.length > 0) {
        const movie = searchData.results[0]
        const primaryGenreId = movie.genre_ids?.[0]
        const mappedGenre = TMDB_GENRES[primaryGenreId] || "Otro"

        let directorName = null
        let castNames = []

        const creditsRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`,
        )

        if (creditsRes.ok) {
          const creditsData = await creditsRes.json()
          // Director
          const director = creditsData.crew?.find(
            (person) => person.job === "Director",
          )
          if (director) directorName = director.name

          // Actores: Tomamos a los 9 actores principales (billing top 9)
          if (creditsData.cast) {
            castNames = creditsData.cast.slice(0, 9).map((actor) => actor.name)
          }
        }

        return { genre: mappedGenre, director: directorName, actors: castNames }
      }
      return { genre: "Otro", director: null, actors: [] }
    } catch (e) {
      console.error(`Error procesando "${title}":`, e)
      return { genre: "Otro", director: null, actors: [] }
    }
  })

  const results = await Promise.all(fetchPromises)

  results.forEach((item) => {
    if (item && item.genre) genreCounts[item.genre] += 1
    if (item && item.director) {
      directorCounts[item.director] = (directorCounts[item.director] || 0) + 1
    }
    // Contabilizamos los actores
    if (item && item.actors) {
      item.actors.forEach((actor) => {
        actorCounts[actor] = (actorCounts[actor] || 0) + 1
      })
    }
  })

  // Devolvemos las 3 métricas
  return { genres: genreCounts, directors: directorCounts, actors: actorCounts }
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
          <div style={{ width: "100%" }}>
            {chartType === "donut" ? (
              <DonutChart genres={genres} />
            ) : (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <RadarChart genres={genres} />
              </div>
            )}
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
// Directors Panel
// ─────────────────────────────────────────────
function DirectorsPanel({ directors, loading }) {
  // Convertir el objeto a arreglo, ordenar de mayor a menor y tomar los primeros 3
  const topDirectors = Object.entries(directors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const hasData = topDirectors.length > 0

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
                color: "rgba(0,229,255,0.5)",
                animation: "pulse 1.2s ease infinite",
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase",
              }}>
              Analizando directores...
            </div>
          </div>
        )}

        {!loading && hasData && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topDirectors.map(([name, count], i) => {
              // Asignar un color distintivo según la posición (Oro, Plata, Bronce, etc)
              const rankColor =
                i === 0
                  ? "#ff004c"
                  : i === 1
                    ? "#9b49b6"
                    : i === 2
                      ? "#00bfff"
                      : i === 3
                        ? "#2ecc71"
                        : "#3fe5ff"

              return (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    background: "rgba(0,0,0,0.3)",
                    padding: "12px 20px",
                    borderRadius: "4px",
                    border: `1.5px solid ${rankColor}`,
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
                      color: "#FFF",
                      fontFamily: "'Space Mono', monospace",
                      letterSpacing: "1px",
                      background: rankColor,
                      padding: "4px 8px",
                      borderRadius: "2px",
                    }}>
                    {count} FILM{count !== 1 ? "S" : ""}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {!loading && !hasData && (
          <div
            style={{
              textAlign: "center",
              fontSize: "0.55rem",
              color: "rgba(255,255,255,0.2)",
              marginTop: "20px",
            }}>
            Sin datos de directores disponibles
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Actors Panel (Diseño de Grilla Cyberpunk)
// ─────────────────────────────────────────────
function ActorsPanel({ actors, loading }) {
  // Tomamos el Top 6 de actores
  const topActors = Object.entries(actors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)

  const hasData = topActors.length > 0

  // Colores para los actores según su posición: maestro, diamante, platino, oro, plata, bronce (estilo neón)
  const rankColors = [
    "#FF004C",
    "#9B49B6",
    "#00BFFF",
    "#2ECC71",
    "#3FE5FF",
    "#FFD700",
    "#C0C0C0",
    "#CD7F32",
    "#555555",
  ]

  return (
    <div
      style={{
        margin: "0 40px 40px",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "4px",
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
        fontFamily: "'Space Mono', monospace",
        color: "#F0EDE5",
      }}>
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "2rem",
          letterSpacing: "3px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
        TOP ACTORES
      </div>

      <div style={{ minHeight: "100px" }}>
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "16px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "4px",
            }}>
            <div
              style={{
                fontSize: "0.55rem",
                letterSpacing: "4px",
                color: "rgba(74,222,128,0.5)",
                animation: "pulse 1.2s ease infinite",
                textTransform: "uppercase",
              }}>
              Escaneando créditos...
            </div>
          </div>
        )}

        {!loading && hasData && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}>
            {topActors.map(([name, count], i) => {
              const rankColor = rankColors[i] || rankColors[0]

              return (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(0,0,0,0.4)",
                    border: `1.4px solid ${rankColor}`,
                    padding: "16px 0",
                    margin: "10px 5px",
                    borderRadius: "4px",
                    transition: "transform 0.2s, background 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.background = "rgba(0,0,0,0.4)"
                  }}>
                  {/* Avatar / Index (Cyberpunk Style) */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: `${rankColor}15`,
                      border: `1px solid ${rankColor}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      marginRight: "16px",
                      marginLeft: "16px",
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "1.2rem",
                      color: rankColor,
                    }}>
                    {i + 1}
                  </div>

                  {/* Nombre y Contador */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        color: "#DBD5CA",
                        marginBottom: "4px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                      {name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        paddingRight: "16px",
                      }}>
                      <div
                        style={{
                          height: "4px",
                          background: `${rankColor}20`,
                          flex: 1,
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min((count / topActors[0][1]) * 100, 100)}%`, // Barra de progreso relativa al #1
                            background: rankColor,
                            boxShadow: `0 0 10px ${rankColor}`,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: "rgba(255,255,255,0.5)",
                        }}>
                        {count} ROLES
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && !hasData && (
          <div
            style={{
              textAlign: "center",
              fontSize: "0.55rem",
              color: "rgba(255,255,255,0.2)",
              marginTop: "20px",
            }}>
            Sin datos de actores disponibles
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
  useMemo(() => {
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
      const isYear = Math.random() > 0.5 && movie.year

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
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #111 0%, #1a1a1a 100%)",
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
            "linear-gradient(to top, #0a0a0a 0%, #0a0a0a 50%, transparent 100%)",
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
  // Perfiles recientes
  const [recentProfiles, setRecentProfiles] = useState([])

  // Cargar perfiles guardados al montar el componente
  useEffect(() => {
    const saved = localStorage.getItem("letterboxd_recent_profiles")
    if (saved) {
      setRecentProfiles(JSON.parse(saved))
    }
  }, [])

  // Genre, Director & Actor state
  const [genres, setGenres] = useState({})
  const [directors, setDirectors] = useState({})
  const [actors, setActors] = useState({})
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

      const rssUrl = `/rss-proxy/${user}/rss/`
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

        return {
          title,
          extractTitle: extractTitle(description) || title,
          link,
          poster: extractPoster(description),
          rating: movieRating,
          year: extractYear(description),
        }
      })

      setMovies(parsed)

      // Fetch genres asynchronously after movies are set
      setLoadingGenres(true)
      try {
        const titles = parsed.map((m) => m.title)
        const {
          genres: genreData,
          directors: directorData,
          actors: actorData,
        } = await fetchMetadataFromTMDB(titles)
        setGenres(genreData)
        setDirectors(directorData)
        setActors(actorData)
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
        background: "#181818",
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
                fontSize: "0.65rem",
                letterSpacing: "2px",
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "all 0.2s",
              }}>
              Iniciar Quiz
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

      {/* Bento grid */}
      {movies.length > 0 && (
        <div style={{ padding: "32px 40px 32px" }}>
          {username && (
            <div
              style={{
                marginBottom: "20px",
                fontSize: "0.6rem",
                letterSpacing: "3px",
                color: "#fafafa",
                textTransform: "uppercase",
              }}>
              @{username} — {movies.length} películas recientes
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
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
        </div>
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

      {/* Renderiza el Modal del Quiz si el estado está activo */}
      {showQuiz && (
        <QuizModal movies={movies} onClose={() => setShowQuiz(false)} />
      )}
    </div>
  )
}
