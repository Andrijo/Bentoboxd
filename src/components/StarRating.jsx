import { useMessages } from "../i18n/index.js"

export default function StarRating({ rating }) {
  const t = useMessages()
  if (!rating) return null
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push("★")
    else if (rating >= i - 0.5) stars.push("½")
    else stars.push("☆")
  }
  return (
    <span
      role="img"
      aria-label={t.common.stars(rating)}
      style={{ color: "var(--c-accent)", fontSize: "var(--fs-xs)", letterSpacing: "1px" }}>
      {stars.join("")}
    </span>
  )
}
