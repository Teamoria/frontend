import { useEffect, useId, useRef } from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiChevronDown,
  FiInbox,
  FiLoader,
  FiPlus,
  FiRefreshCw,
  FiX
} from "react-icons/fi";
import { usePreferences } from "../lib/PreferencesContext.jsx";
import { appCopy, localizedStatus } from "./appData.js";

export function Button({
  children,
  className = "",
  disabled = false,
  icon: Icon,
  loading = false,
  loadingLabel,
  tone = "primary",
  type = "button",
  ...props
}) {
  return (
    <button
      className={`t2-button t2-button--${tone} ${className}`.trim()}
      disabled={loading || disabled}
      type={type}
      {...props}
    >
      {loading ? <FiLoader className="t2-spin" aria-hidden="true" /> : Icon ? <Icon aria-hidden="true" /> : null}
      <span>{loading ? loadingLabel || children : children}</span>
    </button>
  );
}

export function IconButton({ label, children, className = "", ...props }) {
  return (
    <button aria-label={label} className={`t2-icon-button ${className}`.trim()} title={label} type="button" {...props}>
      {children}
    </button>
  );
}

export function PageHeader({ eyebrow, title, subtitle, action, secondaryAction }) {
  return (
    <header className="t2-page-header">
      <div className="t2-page-header__copy">
        {eyebrow ? <span className="t2-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action || secondaryAction ? (
        <div className="t2-page-header__actions">
          {secondaryAction}
          {action}
        </div>
      ) : null}
    </header>
  );
}

export function SectionHeader({ title, description, action, compact = false }) {
  return (
    <header className={`t2-section-header ${compact ? "is-compact" : ""}`}>
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  );
}

export function Metric({ icon: Icon, label, value, detail, tone = "default", progress }) {
  return (
    <article className={`t2-metric t2-metric--${tone}`}>
      <span className="t2-metric__icon" aria-hidden="true">{Icon ? <Icon /> : null}</span>
      <div className="t2-metric__value">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
      {detail ? <small>{detail}</small> : null}
      {typeof progress === "number" ? <Progress value={progress} label={`${label}: ${progress}%`} /> : null}
    </article>
  );
}

export function Progress({ value = 0, label }) {
  const normalized = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <span className="t2-progress" aria-label={label} role="progressbar" aria-valuemax="100" aria-valuemin="0" aria-valuenow={normalized}>
      <span style={{ "--t2-progress": `${normalized}%` }} />
    </span>
  );
}

export function StatusBadge({ value, copy: copyOverride }) {
  const { language } = usePreferences();
  const copy = copyOverride || appCopy[language] || appCopy.en;
  const status = String(value || "active").toLowerCase().replace(/[\s-]+/g, "_");
  const tone = ["completed", "complete", "done", "success", "confirmed"].includes(status)
    ? "completed"
    : ["blocked", "failed", "error", "suspended", "cancelled"].includes(status)
      ? "blocked"
      : ["pending", "todo", "queued", "draft", "invited"].includes(status)
        ? "pending"
        : "active";

  return (
    <span className={`t2-status t2-status--${tone}`}>
      <span aria-hidden="true" />
      {localizedStatus(copy, value)}
    </span>
  );
}

export function Panel({ children, className = "", as: Tag = "section", ...props }) {
  return <Tag className={`t2-panel ${className}`.trim()} {...props}>{children}</Tag>;
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="t2-empty">
      <span className="t2-empty__icon" aria-hidden="true"><FiInbox /></span>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action || null}
    </div>
  );
}

export function ErrorState({ title, onRetry, retryLabel = "Retry" }) {
  return (
    <div className="t2-empty t2-empty--error" role="alert">
      <span className="t2-empty__icon" aria-hidden="true"><FiAlertCircle /></span>
      <h3>{title}</h3>
      {onRetry ? <Button icon={FiRefreshCw} onClick={onRetry} tone="secondary">{retryLabel}</Button> : null}
    </div>
  );
}

export function LoadingState({ label = "Loading" }) {
  return (
    <div className="t2-loading" aria-live="polite" aria-busy="true">
      <FiLoader className="t2-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="t2-skeleton-table" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <span key={index}>
          <i />
          <i />
          <i />
          <i />
        </span>
      ))}
    </div>
  );
}

export function Modal({ children, description, onClose, open, title }) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    const firstFocusable = dialog?.querySelector("button, input, select, textarea, a[href]");
    firstFocusable?.focus();
    document.body.classList.add("t2-modal-open");

    function onKeyDown(event) {
      if (event.key === "Escape") onClose?.();
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("t2-modal-open");
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="t2-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className="t2-modal"
        ref={dialogRef}
        role="dialog"
      >
        <header className="t2-modal__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          <IconButton label="Close" onClick={onClose}><FiX /></IconButton>
        </header>
        <div className="t2-modal__body">{children}</div>
      </section>
    </div>
  );
}

export function Field({ children, error, hint, label, required = false }) {
  return (
    <label className={`t2-field ${error ? "is-invalid" : ""}`}>
      <span className="t2-field__label">{label}{required ? <b aria-hidden="true">*</b> : null}</span>
      {children}
      {error ? <small className="t2-field__error" role="alert">{error}</small> : hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function DrawerLink({ children, href, onClick }) {
  const { direction } = usePreferences();
  const Arrow = direction === "rtl" ? FiArrowLeft : FiArrowRight;
  return (
    <a className="t2-drawer-link" href={href} onClick={onClick}>
      <span>{children}</span>
      <Arrow aria-hidden="true" />
    </a>
  );
}

export function SelectControl({ children, label, ...props }) {
  return (
    <label className="t2-select-control">
      <span className="t2-sr-only">{label}</span>
      <select aria-label={label} {...props}>{children}</select>
      <FiChevronDown aria-hidden="true" />
    </label>
  );
}

export function AddButton({ children, ...props }) {
  return <Button icon={FiPlus} {...props}>{children}</Button>;
}

export function CheckMark({ label }) {
  return <span className="t2-check" title={label}><FiCheck aria-hidden="true" /><span className="t2-sr-only">{label}</span></span>;
}
