import { useState } from "react"
import { formatMonth, formatMonthYear, formatMovieCount } from "../../utils/formatters.js"

const MAX_RATING = 5
const MAX_AXIS_LABELS = 7
// Alto de la barra mayor; `.rd-monthly-bars` deja encima lugar para su cifra.
const BAR_AREA = 76

const columnCenter = (index, total) => ((index + 0.5) / total) * 100
const ratingTop = (rating) => (1 - rating / MAX_RATING) * 100

/** Tramos de meses seguidos con nota: un mes sin nota corta la línea. */
function lineSegments(months) {
  const segments = []
  let current = []

  months.forEach((month, i) => {
    if (month.average === null) {
      if (current.length) segments.push(current)
      current = []
      return
    }
    current.push(`${columnCenter(i, months.length)},${ratingTop(month.average)}`)
  })
  if (current.length) segments.push(current)

  return segments.filter((segment) => segment.length > 1)
}

function monthSummary({ key, count, average }) {
  const rating = average === null ? "sin nota" : `nota media ${average.toFixed(1)}`
  return `${formatMonthYear(key)}: ${formatMovieCount(count)}, ${rating}`
}

/**
 * Dos gráficos alineados por mes, no uno de doble eje: películas y nota tienen
 * escalas distintas. Cada columna es un botón que comparte una sola lectura.
 */
export default function MonthlyChart({ months }) {
  const [activeKey, setActiveKey] = useState(null)
  const lastIndex = months.length - 1
  const maxCount = Math.max(...months.map((m) => m.count))
  const peak = months.find((m) => m.count === maxCount)
  const active = months.find((m) => m.key === activeKey) || months[lastIndex]
  const labelEvery = Math.ceil(months.length / MAX_AXIS_LABELS)
  const lastRated = months.findLast((m) => m.average !== null)

  return (
    <figure style={{ margin: 0 }}>
      <figcaption className="rd-monthly-readout">
        <span className="rd-monthly-readout-values">
          {formatMovieCount(active.count)}
          {active.average !== null && ` · ${active.average.toFixed(1)}★`}
        </span>
        <span>{formatMonthYear(active.key)}</span>
      </figcaption>

      <div className="rd-monthly-plot">
        <div aria-hidden="true">
          <div className="rd-monthly-label">Películas</div>
          <div className="rd-monthly-bars">
            {months.map((month) => {
              const lit = month === active || month === peak
              return (
                <div key={month.key}>
                  {lit && month.count > 0 && <span>{month.count}</span>}
                  <i
                    data-lit={lit ? "" : undefined}
                    style={{ height: month.count ? `${Math.max(4, (month.count / maxCount) * BAR_AREA)}px` : 0 }}
                  />
                </div>
              )
            })}
          </div>

          <div className="rd-monthly-label">Nota media</div>
          <div className="rd-monthly-line">
            <span className="rd-monthly-tick" style={{ top: 0 }}>{MAX_RATING}★</span>
            <span className="rd-monthly-tick" style={{ top: "100%" }}>0</span>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              {lineSegments(months).map((points) => (
                <polyline key={points[0]} points={points.join(" ")} vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
            {months.map((month, i) => month.average !== null && (
              <i
                key={month.key}
                className="rd-monthly-dot"
                data-lit={month === active ? "" : undefined}
                style={{ left: `${columnCenter(i, months.length)}%`, top: `${ratingTop(month.average)}%` }}
              />
            ))}
            {lastRated && (
              <span
                className="rd-monthly-end"
                style={{
                  left: `${columnCenter(months.indexOf(lastRated), months.length)}%`,
                  top: `${ratingTop(lastRated.average)}%`,
                }}>
                {lastRated.average.toFixed(1)}
              </span>
            )}
          </div>

          <div className="rd-monthly-axis">
            {months.map((month, i) => (
              <span key={month.key}>
                {(lastIndex - i) % labelEvery === 0 ? formatMonth(month.key) : ""}
              </span>
            ))}
          </div>
        </div>

        <div role="group" aria-label="Películas y nota media por mes" className="rd-monthly-hits">
          {months.map((month) => (
            <button
              key={month.key}
              type="button"
              aria-label={monthSummary(month)}
              data-active={month === active ? "" : undefined}
              onPointerEnter={() => setActiveKey(month.key)}
              onFocus={() => setActiveKey(month.key)}
              onClick={() => setActiveKey(month.key)}
            />
          ))}
        </div>
      </div>
    </figure>
  )
}
