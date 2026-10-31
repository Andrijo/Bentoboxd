export default function ErrorNotice({ message, onRetry }) {
  return (
    <div className="rd-error-box" role="alert">
      <span><span aria-hidden="true">⚠ </span>{message}</span>
      {onRetry && (
        <button type="button" className="rd-error-retry" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}
