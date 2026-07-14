import { FiRefreshCw, FiSend } from "react-icons/fi";

export default function ChatComposer({
  copy,
  disabledReason,
  draft,
  failedSend,
  onChange,
  onRetrySend,
  onSubmit,
  sending
}) {
  const disabled = sending || !draft.trim() || Boolean(disabledReason);

  return (
    <form className="ai-composer-panel" onSubmit={onSubmit}>
      {failedSend ? (
        <div className="ai-send-retry" role="alert">
          <span>{copy.sendFailed}</span>
          <button onClick={onRetrySend} type="button">
            <FiRefreshCw aria-hidden="true" />
            {copy.retrySend}
          </button>
        </div>
      ) : null}
      <div className="ai-composer-row">
        <textarea
          aria-label={copy.placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form.requestSubmit();
            }
          }}
          placeholder={copy.placeholder}
          rows="1"
          value={draft}
        />
        <button className="ai-send-button" disabled={disabled} type="submit">
          <span>{sending ? copy.processing : copy.send}</span>
          <FiSend aria-hidden="true" />
        </button>
      </div>
      {disabledReason ? <small className="ai-composer-hint">{disabledReason}</small> : null}
    </form>
  );
}
