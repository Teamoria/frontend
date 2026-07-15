import { FiLock, FiRefreshCw } from "react-icons/fi";

export default function ChatProjectSelector({
  activeSession,
  availableScopes = ["general", "company", "project"],
  copy,
  disabled,
  onChange,
  onScopeChange,
  onRetry,
  projects,
  scope,
  selectedProjectId,
  status
}) {
  const locked = Boolean(activeSession);
  const sessionScope = normalizeScope(activeSession?.scope);
  const projectName = activeSession?.project_name || copy.unknownProject;

  if (locked) {
    return (
      <div className="ai-scope-lock">
        <FiLock aria-hidden="true" />
        <div>
          <span>{copy.chatScope}</span>
          <strong>{scopeLabel(sessionScope, copy, projectName)}</strong>
          <small>{scopeDetail(sessionScope, copy)}</small>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-project-selector">
      <label>
        <span>{copy.chatScope}</span>
        <div className="ai-scope-options" role="radiogroup" aria-label={copy.chatScope}>
          {availableScopes.map((option) => (
            <button
              aria-checked={scope === option}
              className={scope === option ? "is-active" : ""}
              disabled={disabled}
              key={option}
              onClick={() => onScopeChange(option)}
              role="radio"
              type="button"
            >
              {scopeLabel(option, copy)}
            </button>
          ))}
        </div>
      </label>

      {scope === "project" ? (
        <label>
          <span>{copy.chooseProject}<b aria-hidden="true">*</b></span>
          <select
            disabled={disabled || status === "loading"}
            onChange={(event) => onChange(event.target.value)}
            value={selectedProjectId}
          >
            <option value="">{status === "loading" ? copy.loadingProjects : copy.chooseProject}</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>
      ) : (
        <p>{scopeDetail(scope, copy)}</p>
      )}

      {status === "error" && scope === "project" ? (
        <button aria-label={copy.retryProjects} onClick={onRetry} type="button">
          <FiRefreshCw aria-hidden="true" />
        </button>
      ) : null}
      {scope === "project" ? <small>{copy.projectScopeDetail}</small> : null}
    </div>
  );
}

function normalizeScope(scope) {
  if (scope === "project" || scope === "company") return scope;
  return "general";
}

function scopeLabel(scope, copy, projectName = "") {
  if (scope === "project") return projectName ? `${copy.projectScope} - ${projectName}` : copy.projectScope;
  if (scope === "company") return copy.companyScope;
  return copy.generalScope;
}

function scopeDetail(scope, copy) {
  if (scope === "project") return copy.projectScopeDetail;
  if (scope === "company") return copy.companyScopeDetail;
  return copy.generalScopeDetail;
}
