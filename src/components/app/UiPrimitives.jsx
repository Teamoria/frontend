export function EmptyState({ action = null, children, icon: Icon, title }) {
  return (
    <div className="tm-empty-state">
      {Icon ? (
        <span className="tm-empty-state__icon" aria-hidden="true">
          <Icon />
        </span>
      ) : null}
      <h3>{title}</h3>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}

export function LoadingState({ children = "Loading workspace data..." }) {
  return (
    <div className="tm-loading-state" role="status" aria-live="polite">
      <span className="tm-skeleton tm-skeleton--avatar" />
      <span>{children}</span>
    </div>
  );
}

export function StatusBadge({ children, tone = "neutral" }) {
  return <span className={`tm-status tm-status--${tone}`}>{children}</span>;
}

export function MetricCard({ detail, icon: Icon, label, tone = "primary", value }) {
  return (
    <article className={`tm-metric-card tm-metric-card--${tone}`}>
      <div className="tm-metric-card__top">
        <span>{label}</span>
        {Icon ? <Icon aria-hidden="true" /> : null}
      </div>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </article>
  );
}
