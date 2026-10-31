import { useMemo } from "react"
import { NO_FILTERS, filterOptions } from "../utils/movieFilters.js"

function FilterSelect({ label, allLabel, value, onChange, children }) {
  return (
    <label className="rd-filter">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{allLabel}</option>
        {children}
      </select>
    </label>
  )
}

export default function MovieFilters({ movies, filters, onChange }) {
  const { ratings, years } = useMemo(() => filterOptions(movies), [movies])
  const active = filters.liked || filters.rating || filters.year

  return (
    <div role="group" aria-label="Filtros de películas" className="rd-movie-filters">
      <button
        type="button"
        aria-pressed={filters.liked}
        className="rd-btn-outline"
        onClick={() => onChange({ ...filters, liked: !filters.liked })}>
        <span aria-hidden="true">♥</span> Me gusta
      </button>

      <FilterSelect
        label="Nota"
        allLabel="Todas"
        value={filters.rating}
        onChange={(rating) => onChange({ ...filters, rating })}>
        {ratings.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </FilterSelect>

      <FilterSelect
        label="Estreno"
        allLabel="Todos"
        value={filters.year}
        onChange={(year) => onChange({ ...filters, year })}>
        {years.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </FilterSelect>

      {active && (
        <button type="button" className="rd-btn-outline" onClick={() => onChange(NO_FILTERS)}>
          Quitar filtros
        </button>
      )}
    </div>
  )
}
