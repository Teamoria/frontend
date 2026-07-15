import { FiLock, FiRefreshCw } from "react-icons/fi";

export default function ChatProjectSelector({
  activeSession,
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
  const sessionScope = activeSession?.scope === "project" ? "project" : "company";
  const projectName = activeSession?.project_name || copy.unknownProject;

  if (locked) {
    return (
      <div className="ai-scope-lock">
        <FiLock aria-hidden="true" />
        <div>
          <span>{copy.chatScope}</span>
          <strong>{sessionScope === "project" ? `${copy.projectScope} - ${projectName}` : copy.companyScope}</strong>
          <small>{sessionScope === "project" ? copy.projectSessionDetail : copy.companySessionDetail}</small>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-project-selector">
      <label>
        <span>{copy.chatScope}</span>
        <select disabled={disabled} onChange={(event) => onScopeChange(event.target.value)} value={scope}>
          <option value="company">{copy.companyScope}</option>
          <option value="project">{copy.projectScope}</option>
        </select>
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
        <p>{copy.companyScopeDetail}</p>
      )}

      {status === "error" && scope === "project" ? (
        <button aria-label={copy.retryProjects} onClick={onRetry} type="button">
          <FiRefreshCw aria-hidden="true" />
        </button>
      ) : null}
      <small>{scope === "project" ? copy.projectScopeDetail : copy.companySessionDetail}</small>
    </div>
  );
}
