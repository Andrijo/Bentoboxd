import { useState } from "react"
import { getInitials } from "../utils/formatters.js"

export default function PersonAvatar({ name, photo, rank, compact = false }) {
  const [failedPhoto, setFailedPhoto] = useState(null)

  return (
    <span className="rd-person-avatar" data-compact={compact ? "" : undefined}>
      <span aria-hidden="true" className="rd-person-initials">{getInitials(name)}</span>
      {photo && photo !== failedPhoto && (
        <img
          src={photo}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailedPhoto(photo)}
        />
      )}
      <span className="rd-person-rank">{rank}</span>
    </span>
  )
}
