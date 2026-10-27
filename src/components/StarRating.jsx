export default function StarRating({ rating }) {
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
      aria-label={`${rating} de 5 estrellas`}
      style={{ color: "#00e5ff", fontSize: "var(--fs-xs)", letterSpacing: "1px" }}>
      {stars.join("")}
    </span>
  )
}
