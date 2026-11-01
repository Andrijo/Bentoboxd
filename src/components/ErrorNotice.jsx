import { useMessages } from "../i18n/index.js"

export default function ErrorNotice({ message, onRetry }) {
  const t = useMessages()

  return (
    <div className="rd-error-box" role="alert">
      <span><span aria-hidden="true">⚠ </span>{message}</span>
      {onRetry && (
        <button type="button" className="rd-error-retry" onClick={onRetry}>
          {t.common.retry}
        </button>
      )}
    </div>
  )
}
