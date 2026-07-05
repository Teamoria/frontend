import {
  FiArrowUp,
  FiChevronsUp,
  FiEdit3,
  FiFolder,
  FiInfo,
  FiPlus,
  FiRefreshCw,
  FiSliders,
  FiTarget,
  FiTrendingUp,
  FiUserPlus,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import AppShell from "../components/app/AppShell.jsx";
import { EmptyState, LoadingState, MetricCard, StatusBadge } from "../components/app/UiPrimitives.jsx";
import {
  addCompanyProjectMembers,
  createCompanyProject,
  getPayloadData,
  listCompanyProjects,
  listStaff,
  removeCompanyProjectMember,
  updateCompanyProject
} from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import "../styles/owner-projects.css";

export default function OwnerProjectsPage() {
  const { user } = useAuth();
  const [projectModal, setProjectModal] = useState(null);
  const [projects, setProjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const summaryCards = useMemo(() => {
    const activeProjects = projects.filter((project) => normalizeStatus(project.status) === "active").length;
    const pendingProjects = projects.filter((project) => ["pending", "paused"].includes(normalizeStatus(project.status))).length;
    const averageProgress = projects.length
      ? Math.round(projects.reduce((total, project) => total + normalizeProgress(project.progress), 0) / projects.length)
      : 0;

    return [
      { label: "Total Active Projects", value: String(activeProjects), detail: `${projects.length} projects loaded from API`, icon: FiFolder, tone: "primary" },
      { label: "Avg. Progress", value: `${averageProgress}%`, detail: "Live company workspace data", icon: FiTrendingUp, tone: "secondary" },
      { label: "Pending / Paused", value: String(pendingProjects), detail: "Needs owner attention", icon: FiTarget, tone: "warning" }
    ];
  }, [projects]);

  useEffect(() => {
    loadProjects();
    loadStaff();
  }, []);

  async function loadProjects() {
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = await listCompanyProjects();
      const data = getPayloadData(payload);
      const rows = data?.projects || data?.data || data || [];
      setProjects(Array.isArray(rows) ? rows.map(normalizeProject) : []);
    } catch (error) {
      setProjects([]);
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadStaff() {
    try {
      const payload = await listStaff();
      const data = getPayloadData(payload);
      const rows = data?.users || data?.staff || data?.data || data || [];
      setStaff(Array.isArray(rows) ? rows.map(normalizeStaffMember) : []);
    } catch {
      setStaff([]);
    }
  }

  function handleProjectSaved(project, message = "Project saved successfully.") {
    if (project) {
      setProjects((current) => {
        const normalized = normalizeProject(project);
        const exists = current.some((item) => String(item.id) === String(normalized.id));

        if (!exists) {
          return [normalized, ...current];
        }

        return current.map((item) => (String(item.id) === String(normalized.id) ? normalized : item));
      });
    }

    setStatus({ type: "success", message });
    loadProjects();
  }

  return (
    <AppShell active="Projects" role="Company Owner" roleId="owner" user={user?.name || "Company Owner"}>
      <div className="owner-projects-page">
      <div className="owner-projects-sticky-head">
        <div className="owner-projects-titlebar">
          <div>
            <h1>Projects Directory</h1>
            <p>Manage company projects, members, progress, and delivery status.</p>
          </div>
          <div className="owner-projects-actions">
            <button className="owner-projects-refresh" type="button" onClick={loadProjects} disabled={isLoading}>
              <FiRefreshCw aria-hidden="true" />
              Refresh
            </button>
            <button className="owner-projects-primary" type="button" onClick={() => setProjectModal({ mode: "create", project: null })}>
              <FiPlus aria-hidden="true" />
              New Project
            </button>
          </div>
        </div>

        <div className="owner-projects-filterbar">
          <label>
            <span>Filter by:</span>
            <select defaultValue="all">
              <option value="all">All Projects</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="paused">Paused</option>
            </select>
          </label>
          <button className="owner-projects-sort" type="button">
            <FiSliders aria-hidden="true" />
            Sort By
          </button>
        </div>
      </div>

      <section className="owner-projects-summary-grid">
        {summaryCards.map(({ detail, icon: Icon, label, tone, value }) => (
          <MetricCard
            detail={detail}
            icon={Icon}
            key={label}
            label={label}
            tone={tone}
            value={value}
          />
        ))}
      </section>

      {status.message ? (
        <p className={`auth-alert auth-alert--${status.type} owner-projects-alert`} role="alert" aria-live="polite">
          {status.message}
        </p>
      ) : null}

      <section className="owner-projects-table-panel">
        <div className="owner-projects-table-wrap">
          <div className="container--scroll-x">
            <table className="owner-projects-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Priority</th>
                  <th>Progress</th>
                  <th>Team</th>
                  <th>AI Health Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <MessageRow text="Loading projects from API..." />
                ) : projects.length === 0 ? (
                  <MessageRow text="No projects found in the company workspace." />
                ) : projects.map((project) => (
                  <tr key={project.id || project.name}>
                    <td>
                      <b>{project.name}</b>
                      <span>{project.description || formatDateRange(project.start_date, project.end_date)}</span>
                    </td>
                    <td>
                      <span className={`owner-projects-priority priority-${project.priority.toLowerCase()}`}>
                        {project.priority === "High" ? <FiChevronsUp aria-hidden="true" /> : <FiArrowUp aria-hidden="true" />}
                        {project.priority}
                      </span>
                    </td>
                    <td>
                      <div className="owner-projects-progress">
                        <div><i style={{ width: `${project.progress}%` }} /></div>
                        <span>{project.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="owner-projects-team-cell">
                        <div className="owner-projects-avatar-stack">
                          {project.team.map((member) => <span key={member}>{member}</span>)}
                        </div>
                        <small>{project.teamLabel}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`owner-projects-health ${project.status === "At Risk" ? "health-risk" : ""}`}>
                        <i />
                        {project.health}
                      </span>
                    </td>
                    <td>
                      <StatusBadge tone={getStatusTone(project.status)}>
                        {project.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="owner-projects-row-actions">
                        <button type="button" onClick={() => setProjectModal({ mode: "edit", project })}>
                          <FiEdit3 aria-hidden="true" />
                          Edit
                        </button>
                        <button type="button" onClick={() => setProjectModal({ mode: "members", project })}>
                          <FiUserPlus aria-hidden="true" />
                          Members
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="owner-projects-bottom-grid">
        <article>
          <FiUsers aria-hidden="true" />
          <div>
            <h3>Company Owner Baseline</h3>
            <p>Track project ownership, team members, and delivery status from one workspace.</p>
          </div>
        </article>
        <article>
          <FiZap aria-hidden="true" />
          <div>
            <h3>AI Health Review</h3>
            <p>Risk, progress, and health scores are grouped so managers can decide what needs attention first.</p>
          </div>
        </article>
      </section>

      {projectModal ? (
        <ProjectModal
          mode={projectModal.mode}
          project={projectModal.project}
          staff={staff}
          onClose={() => setProjectModal(null)}
          onSaved={handleProjectSaved}
        />
      ) : null}
      </div>
    </AppShell>
  );
}

function ProjectModal({ mode, project, staff, onClose, onSaved }) {
  const isEditing = mode === "edit" || mode === "members";
  const isMembersOnly = mode === "members";
  const [form, setForm] = useState({
    name: project?.name || "",
    description: project?.description || "",
    status: normalizeStatus(project?.status || "active"),
    progress: project?.progress ?? 0,
    start_date: toDateInputValue(project?.start_date),
    end_date: toDateInputValue(project?.end_date)
  });
  const [selectedMemberIds, setSelectedMemberIds] = useState(() => getProjectUserIds(project));
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleMember(userId) {
    setSelectedMemberIds((current) => {
      if (current.includes(userId)) {
        return current.filter((id) => id !== userId);
      }

      return [...current, userId];
    });
  }

  async function submitProject(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!isMembersOnly && !form.name.trim()) {
      setStatus({ type: "error", message: "Project name is required." });
      return;
    }

    setIsSaving(true);

    try {
      let savedProject = project;

      if (!isMembersOnly) {
        const projectBody = {
          ...form,
          progress: Number(form.progress || 0)
        };
        const payload = isEditing
          ? await updateCompanyProject(project.id, projectBody)
          : await createCompanyProject(projectBody);
        const data = getPayloadData(payload);
        savedProject = data?.project || data;
      }

      if (savedProject?.id) {
        await syncProjectMembers(savedProject, selectedMemberIds, { removeMissing: isEditing });
      }

      onSaved(
        savedProject,
        isMembersOnly ? "Project members updated successfully." : isEditing ? "Project updated successfully." : "Project created successfully."
      );
      onClose();
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSaving(false);
    }
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="initialize-project-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <form className="initialize-project-modal initialize-project-modal--single" role="dialog" aria-modal="true" aria-labelledby="initialize-project-title" onSubmit={submitProject}>
        <header className="initialize-project-header">
          <div className="initialize-project-title-row">
            <div>
              <span className="initialize-project-kicker">Company project</span>
              <h2 id="initialize-project-title">{isEditing ? "Edit Project" : "Create New Project"}</h2>
              <p>{isMembersOnly ? "Update who can work on this project." : "Add project details and assign employees in one step."}</p>
            </div>
          </div>
          <button className="initialize-project-close" type="button" aria-label="Close" onClick={onClose}>
            <FiX aria-hidden="true" />
          </button>
        </header>

        {status.message ? <p className={`auth-alert auth-alert--${status.type}`}>{status.message}</p> : null}

        <div className="initialize-project-body">
          <section className="initialize-project-step initialize-project-step--single">
            <div className="initialize-project-fields">
              {!isMembersOnly ? (
              <>
              <label className="initialize-project-field-wide">
                <span>Project name <em>*</em></span>
                <input
                  autoFocus
                  placeholder="e.g., Q3 Marketing Campaign"
                  required
                  disabled={isMembersOnly}
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </label>

              <label>
                <span>Status</span>
                <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>

              <label>
                <span>Progress</span>
                <input
                  min="0"
                  max="100"
                  placeholder="0"
                  type="number"
                  value={form.progress}
                  onChange={(event) => updateField("progress", event.target.value)}
                />
              </label>

              <label>
                <span>Start date</span>
                <input required type="date" value={form.start_date} onChange={(event) => updateField("start_date", event.target.value)} />
              </label>

              <label>
                <span>End date</span>
                <input required type="date" value={form.end_date} onChange={(event) => updateField("end_date", event.target.value)} />
              </label>

              <label className="initialize-project-field-wide">
                <span>Description</span>
                <textarea
                  placeholder="Briefly describe the project goals..."
                  required
                  rows="4"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                />
              </label>
              </>
              ) : null}

              <fieldset className="initialize-project-members initialize-project-field-wide">
                <legend>Project employees</legend>
                {staff.length === 0 ? (
                  <p>No employees loaded yet.</p>
                ) : (
                  <div>
                    {staff.map((member) => (
                      <label key={member.id}>
                        <input
                          checked={selectedMemberIds.includes(member.id)}
                          type="checkbox"
                          onChange={() => toggleMember(member.id)}
                        />
                        <span>{member.initials}</span>
                        <b>{member.name}</b>
                        <small>{member.role}</small>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>

              <article className="initialize-project-note initialize-project-field-wide">
                <FiInfo aria-hidden="true" />
                <div>
                  <h4>Saved to workspace</h4>
                  <p>Project details and selected employees are saved to the company workspace.</p>
                </div>
              </article>
            </div>
          </section>
        </div>

        <footer className="initialize-project-footer">
          <button className="initialize-project-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <div>
            <button className="initialize-project-primary" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
              <FiZap aria-hidden="true" />
            </button>
          </div>
        </footer>
      </form>
    </div>,
    document.body
  );
}

function MessageRow({ text }) {
  const isLoading = text.toLowerCase().includes("loading");

  return (
    <tr>
      <td className="owner-projects-empty-cell" colSpan="7">
        {isLoading ? (
          <LoadingState>{text}</LoadingState>
        ) : (
          <EmptyState icon={FiFolder} title="No projects yet">
            {text}
          </EmptyState>
        )}
      </td>
    </tr>
  );
}

async function syncProjectMembers(project, selectedMemberIds, { removeMissing = false } = {}) {
  const projectId = project.id;
  const currentIds = getProjectUserIds(project);
  const idsToAdd = selectedMemberIds.filter((id) => !currentIds.includes(id));
  const idsToRemove = removeMissing ? currentIds.filter((id) => !selectedMemberIds.includes(id)) : [];

  if (idsToAdd.length > 0) {
    await addCompanyProjectMembers(projectId, {
      user_ids: idsToAdd,
      role: "member"
    });
  }

  if (idsToRemove.length > 0) {
    await Promise.all(idsToRemove.map((userId) => removeCompanyProjectMember(projectId, userId)));
  }
}

function getProjectUserIds(project) {
  const users = normalizeResourceCollection(project?.users || project?.members || []);
  return users.map((member) => String(member.id || member.user_id || member.user?.id)).filter(Boolean);
}

function normalizeStaffMember(member) {
  const value = member.user || member;
  const name = value.name || value.full_name || value.email || "Employee";

  return {
    id: String(value.id),
    name,
    email: value.email || "",
    role: formatLabel(value.role || "member"),
    initials: getInitials(name)
  };
}

function normalizeProject(project) {
  const status = normalizeStatus(project.status);
  const progress = normalizeProgress(project.progress);
  const members = normalizeResourceCollection(project.members || project.users || project.team || []);

  return {
    ...project,
    name: project.name || project.title || "Untitled project",
    description: project.description || "",
    priority: getPriority(status, progress),
    progress,
    status: formatLabel(status || "pending"),
    team: getTeamInitials(members),
    teamLabel: members.length ? `${members.length} members` : "No members",
    health: `${getHealthScore(status, progress)}/100`
  };
}

function normalizeStatus(status) {
  return String(status || "pending").toLowerCase().replace(/\s+/g, "_");
}

function normalizeProgress(progress) {
  const value = Number(progress || 0);

  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getPriority(status, progress) {
  if (["paused", "cancelled"].includes(status) || progress < 25) return "High";
  if (status === "pending" || progress < 60) return "Medium";
  return "Medium";
}

function getHealthScore(status, progress) {
  if (status === "completed") return 100;
  if (status === "cancelled") return 20;
  if (status === "paused") return 55;
  if (status === "pending") return 70;
  return Math.max(60, Math.min(98, 65 + Math.round(progress / 3)));
}

function getTeamInitials(members) {
  if (!Array.isArray(members) || members.length === 0) return ["--"];

  const initials = members.slice(0, 2).map((member) => {
    const value = member.name || member.email || member.user?.name || member.user?.email || "User";
    return String(value)
      .split(/\s|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";
  });

  if (members.length > 2) {
    initials.push(`+${members.length - 2}`);
  }

  return initials;
}

function normalizeResourceCollection(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function getInitials(value) {
  return String(value || "User")
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function toDateInputValue(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return "No timeline set";
  if (startDate && endDate) return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  return formatDate(startDate || endDate);
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function formatLabel(value) {
  return String(value || "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusTone(status) {
  const value = normalizeStatus(status);

  if (["active", "completed"].includes(value)) return "success";
  if (["pending", "paused"].includes(value)) return "warning";
  if (["cancelled", "at_risk"].includes(value)) return "danger";
  return "neutral";
}

