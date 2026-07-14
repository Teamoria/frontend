import { FiLock, FiRefreshCw } from "react-icons/fi";

export default function ChatProjectSelector({
  activeSession,
  copy,
  disabled,
  onChange,
  onRetry,
  projects,
  selectedProjectId,
  status
}) {
  const locked = Boolean(activeSession);
  const projectName = activeSession?.project_name || copy.unknownProject;

  if (locked) {
    return (
      <div className="ai-scope-lock">
        <FiLock aria-hidden="true" />
        <div>
          <span>{copy.projectScope}</span>
          <strong>{projectName}</strong>
        </div>
      </div>
    );
  }

  return (
    <label className="ai-project-selector">
      <span>{copy.projectScope}<b aria-hidden="true">*</b></span>
      <select
        disabled={disabled || status === "loading"}
        onChange={(event) => onChange(event.target.value)}
        value={selectedProjectId}
      >
        <option value="">{status === "loading" ? copy.loadingProjects : copy.chooseProject}</option>
        {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
      </select>
      {status === "error" ? (
        <button aria-label={copy.retryProjects} onClick={onRetry} type="button">
          <FiRefreshCw aria-hidden="true" />
        </button>
      ) : null}
      <small>{copy.frontendSafeguard}</small>
    </label>
  );
}
