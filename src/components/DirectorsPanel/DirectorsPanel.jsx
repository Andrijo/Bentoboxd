import { useState } from "react"
import DirectorCards from "./DirectorCards.jsx"
import DirectorHologram from "./DirectorHologram.jsx"
import { PanelSkeleton } from "../Skeleton.jsx"
import Panel from "../Panel/Panel.jsx"
import SegmentedControl from "../Panel/SegmentedControl.jsx"
import { topDirectors } from "../../utils/topDirectors.js"
import { useMessages } from "../../i18n/index.js"

const VIEW_KEYS = ["cards", "hologram"]

export default function DirectorsPanel({ directors, movies, photos, loading }) {
  const t = useMessages()
  const [viewMode, setViewMode] = useState("cards")

  const ranking = topDirectors(directors)
  const hasData = ranking.length > 0
  const hasDirectors = Object.keys(directors || {}).length > 0

  return (
    <Panel
      id="rd-panel-directores"
      area="directors"
      title={t.directorsPanel.title}
      subtitle={hasData && !loading && t.directorsPanel.subtitle}
      actions={hasData && !loading && (
        <SegmentedControl
          label={t.directorsPanel.viewLabel}
          options={VIEW_KEYS.map((key) => ({ key, label: t.directorsPanel.views[key] }))}
          value={viewMode}
          onChange={setViewMode}
        />
      )}
      bodyStyle={{ minHeight: "220px" }}>
      {loading && <PanelSkeleton variant="rows" label={t.directorsPanel.loading} />}

      {!loading && hasData && (
        <>
          {viewMode === "cards" && <DirectorCards ranking={ranking} movies={movies} photos={photos} />}
          {viewMode === "hologram" && <DirectorHologram ranking={ranking} />}
        </>
      )}

      {!loading && !hasData && (
        <div style={{
          textAlign: "center", fontSize: "var(--fs-xs)",
          color: "var(--c-text-muted)", marginTop: "20px",
          fontFamily: "var(--font-mono)",
        }}>
          {hasDirectors
            ? t.directorsPanel.noneRepeated
            : t.directorsPanel.empty}
        </div>
      )}
    </Panel>
  )
}
