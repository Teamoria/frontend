import { useEffect, useState } from "react";
import { FiCalendar, FiCheckSquare, FiFileText, FiFlag, FiFolder, FiSearch, FiTrash2, FiType, FiUserPlus } from "react-icons/fi";
import { addTaskAssignees, createTask, getCompanyProject, getPayloadData } from "../../../lib/api.js";
import { isDemoMode } from "../../../lib/demoMode.js";
import { textFor } from "../../appData.js";
import { Button, EmptyState, ErrorState, LoadingState } from "../../ui.jsx";
import { normalizeProjectMembers } from "../projects/projectHelpers.js";
import "./taskCreateModal.css";
import { localizedTaskPriority, localizedTaskStatus, taskPriorityOptions, taskStatusOptions } from "./taskHelpers.js";

function TaskField({ children, className = "", error, icon: Icon, label, required = false }) {
  return (
    <label className={`task-create-field ${error ? "is-invalid" : ""} ${className}`.trim()}>
      <span className="task-create-field__label">
        {Icon ? <Icon aria-hidden="true" /> : null}
        <span>{label}{required ? <b aria-hidden="true">*</b> : null}</span>
      </span>
      {children}
      {error ? <small className="task-create-field__error" role="alert">{error}</small> : null}
    </label>
  );
}

export default function TaskCreateForm({ copy, language, onBusyChange, onCancel, onSaved, projects, projectsStatus, role }) {
  const createLabel = textFor(language, { ar: "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0647\u0645\u0629", en: "Create task" });
  const cancelLabel = textFor(language, { ar: "\u0625\u0644\u063a\u0627\u0621", en: "Cancel" });
  const descriptionLabel = textFor(language, { ar: "\u0627\u0644\u0648\u0635\u0641", en: "Description" });
  const dueDateLabel = textFor(language, { ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0633\u062a\u062d\u0642\u0627\u0642", en: "Due date" });
  const loadingLabel = textFor(language, { ar: "\u062c\u0627\u0631\u064a \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0647\u0645\u0629", en: "Creating task" });
  const projectLabel = textFor(language, { ar: "\u0627\u0644\u0645\u0634\u0631\u0648\u0639", en: "Project" });
  const assigneeLabel = textFor(language, { ar: "\u0625\u0633\u0646\u0627\u062f \u0625\u0644\u0649", en: "Assign to" });
  const assigneeHint = textFor(language, { ar: "\u064a\u062a\u0645 \u0639\u0631\u0636 \u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0645\u062d\u062f\u062f \u0641\u0642\u0637.", en: "Only members of the selected project are available." });
  const selectProjectFirstLabel = textFor(language, { ar: "\u062d\u062f\u062f \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0623\u0648\u0644\u0627\u064b", en: "Select a project first" });
  const searchAssigneesLabel = textFor(language, { ar: "\u0627\u0628\u062d\u062b \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0628\u0631\u064a\u062f", en: "Search by name or email" });
  const noProjectMembersLabel = textFor(language, { ar: "\u0644\u0627 \u064a\u0648\u062c\u062f \u0623\u0639\u0636\u0627\u0621 \u0645\u062a\u0627\u062d\u0648\u0646 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0645\u0634\u0631\u0648\u0639.", en: "No members are available in this project." });
  const selectedAssigneesLabel = textFor(language, { ar: "\u0627\u0644\u0645\u0643\u0644\u0641\u0648\u0646 \u0627\u0644\u0645\u062d\u062f\u062f\u0648\u0646", en: "Selected assignees" });
  const noAssigneesLabel = textFor(language, { ar: "\u0644\u0645 \u064a\u062a\u0645 \u0627\u062e\u062a\u064a\u0627\u0631 \u0645\u0643\u0644\u0641\u064a\u0646 \u0628\u0639\u062f.", en: "No assignees selected yet." });
  const addAssigneeLabel = textFor(language, { ar: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0643\u0644\u0641", en: "Add assignee" });
  const removeAssigneeLabel = textFor(language, { ar: "\u0625\u0632\u0627\u0644\u0629 \u0645\u0643\u0644\u0641", en: "Remove assignee" });
  const requiredProjectMessage = textFor(language, { ar: "\u062d\u062f\u062f \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0642\u0628\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0647\u0645\u0629.", en: "Select a project before creating the task." });
  const requiredTitleMessage = textFor(language, { ar: "\u0623\u062f\u062e\u0644 \u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0647\u0645\u0629.", en: "Enter a task title." });
  const invalidDueDateMessage = textFor(language, { ar: "\u0623\u062f\u062e\u0644 \u062a\u0627\u0631\u064a\u062e \u0627\u0633\u062a\u062d\u0642\u0627\u0642 \u0635\u062d\u064a\u062d.", en: "Enter a valid due date." });
  const partialAssigneeMessage = textFor(language, {
    ar: "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0647\u0645\u0629 \u0628\u0646\u062c\u0627\u062d\u060c \u0644\u0643\u0646 \u062a\u0639\u0630\u0631\u062a \u0625\u0636\u0627\u0641\u0629 \u0628\u0639\u0636 \u0627\u0644\u0645\u0643\u0644\u0641\u064a\u0646.",
    en: "Task created successfully, but some assignees could not be added."
  });
  const titleLabel = textFor(language, { ar: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0647\u0645\u0629", en: "Task title" });
  const [form, setForm] = useState({
    project_id: projects[0]?.id || "",
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [memberStatus, setMemberStatus] = useState(form.project_id ? "loading" : "idle");
  const [memberError, setMemberError] = useState("");
  const [projectMembers, setProjectMembers] = useState([]);
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [memberRevision, setMemberRevision] = useState(0);

  useEffect(() => {
    onBusyChange?.(loading);
    return () => onBusyChange?.(false);
  }, [loading, onBusyChange]);

  useEffect(() => {
    if (!form.project_id && projects[0]?.id) {
      setForm((current) => ({ ...current, project_id: projects[0].id }));
    }
  }, [form.project_id, projects]);

  useEffect(() => {
    let active = true;
    setSelectedAssignees([]);
    setAssigneeQuery("");
    setProjectMembers([]);
    setMemberError("");

    if (!form.project_id) {
      setMemberStatus("idle");
      return () => { active = false; };
    }

    if (isDemoMode()) {
      setMemberStatus("ready");
      return () => { active = false; };
    }

    setMemberStatus("loading");
    getCompanyProject(form.project_id)
      .then((payload) => {
        if (!active) return;
        const data = getPayloadData(payload);
        const project = data?.project || data;
        setProjectMembers(normalizeProjectMembers(project));
        setMemberStatus("ready");
      })
      .catch((requestError) => {
        if (!active) return;
        setMemberError(requestError?.message || copy.failedLoad);
        setMemberStatus("error");
      });

    return () => { active = false; };
  }, [copy.failedLoad, form.project_id, memberRevision]);

  const selectedIds = new Set(selectedAssignees.map((assignee) => assignee.id));
  const filteredMembers = projectMembers
    .filter((member) => !selectedIds.has(member.id))
    .filter((member) => {
      const query = assigneeQuery.trim().toLowerCase();
      if (!query) return true;
      return [member.name, member.email].join(" ").toLowerCase().includes(query);
    });

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  function setProject(value) {
    setField("project_id", value);
  }

  function addAssignee(member) {
    setSelectedAssignees((current) => current.some((assignee) => assignee.id === member.id) ? current : [...current, member]);
    setAssigneeQuery("");
  }

  function removeAssignee(memberId) {
    setSelectedAssignees((current) => current.filter((assignee) => assignee.id !== memberId));
  }

  function validate() {
    const nextErrors = {};
    if (!form.project_id) nextErrors.project_id = requiredProjectMessage;
    if (!form.title.trim()) nextErrors.title = requiredTitleMessage;
    if (form.due_date && Number.isNaN(new Date(form.due_date).getTime())) nextErrors.due_date = invalidDueDateMessage;
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const body = {
        project_id: form.project_id,
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        due_date: form.due_date
      };
      const payload = isDemoMode() ? { data: { id: `demo-task-${Date.now()}`, ...body } } : await createTask(body, { role });
      const data = getPayloadData(payload);
      const task = data?.task || data;
      const taskId = task?.id || task?.task_id || task?.uuid;
      if (!isDemoMode() && selectedAssignees.length && !taskId) {
        onSaved(task, { warning: partialAssigneeMessage });
        return;
      }
      if (!isDemoMode() && selectedAssignees.length && taskId) {
        try {
          await addTaskAssignees(taskId, { user_ids: selectedAssignees.map((assignee) => assignee.id) }, { role });
        } catch {
          onSaved(task, { warning: partialAssigneeMessage });
          return;
        }
      }
      onSaved(task);
    } catch (requestError) {
      setError(requestError?.message || copy.failedSave);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="task-create-modal" dir={language === "ar" ? "rtl" : "ltr"} onSubmit={submit}>
      {error ? <p className="t2-form-alert is-error" role="alert">{error}</p> : null}
      <div className="task-create-grid">
        <TaskField className="task-create-field--project" error={fieldErrors.project_id} icon={FiFolder} label={projectLabel} required>
          <select
            aria-invalid={Boolean(fieldErrors.project_id)}
            disabled={loading || projectsStatus === "loading" || projects.length === 0}
            value={form.project_id}
            onChange={(event) => setProject(event.target.value)}
          >
            {projects.length ? projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>) : <option value="">{copy.noData}</option>}
          </select>
        </TaskField>

        <TaskField icon={FiCheckSquare} label={copy.status}>
          <select disabled={loading} value={form.status} onChange={(event) => setField("status", event.target.value)}>
            {taskStatusOptions().map((status) => <option key={status} value={status}>{localizedTaskStatus(copy, status)}</option>)}
          </select>
        </TaskField>

        <TaskField error={fieldErrors.title} icon={FiType} label={titleLabel} required>
          <input
            aria-invalid={Boolean(fieldErrors.title)}
            disabled={loading}
            value={form.title}
            onChange={(event) => setField("title", event.target.value)}
          />
        </TaskField>

        <TaskField icon={FiFlag} label={copy.priority}>
          <select disabled={loading} value={form.priority} onChange={(event) => setField("priority", event.target.value)}>
            {taskPriorityOptions().map((priority) => <option key={priority} value={priority}>{localizedTaskPriority(copy, priority)}</option>)}
          </select>
        </TaskField>

        <section className="task-create-assignees" aria-labelledby="task-create-assignees-title">
          <header>
            <span aria-hidden="true"><FiUserPlus /></span>
            <div>
              <h3 id="task-create-assignees-title">{assigneeLabel}</h3>
              <p>{form.project_id ? assigneeHint : selectProjectFirstLabel}</p>
            </div>
          </header>

          <label className={`task-assignee-search ${!form.project_id ? "is-disabled" : ""}`.trim()}>
            <FiSearch aria-hidden="true" />
            <span className="t2-sr-only">{searchAssigneesLabel}</span>
            <input
              disabled={loading || !form.project_id || memberStatus !== "ready" || !projectMembers.length}
              placeholder={form.project_id ? searchAssigneesLabel : selectProjectFirstLabel}
              type="search"
              value={assigneeQuery}
              onChange={(event) => setAssigneeQuery(event.target.value)}
            />
          </label>

          {!form.project_id ? <p className="task-assignee-placeholder">{selectProjectFirstLabel}</p> : null}
          {form.project_id && memberStatus === "loading" ? <LoadingState label={copy.loading} /> : null}
          {form.project_id && memberStatus === "error" ? <ErrorState onRetry={() => setMemberRevision((value) => value + 1)} retryLabel={copy.retry} title={memberError || copy.failedLoad} /> : null}
          {form.project_id && memberStatus === "ready" ? (
            <>
              <div className="task-assignee-options" aria-label={addAssigneeLabel}>
                {projectMembers.length ? filteredMembers.slice(0, 8).map((member) => (
                  <button disabled={loading} key={member.id} onClick={() => addAssignee(member)} type="button">
                    <span className="task-assignee-avatar" aria-hidden="true">{member.name.slice(0, 1).toUpperCase()}</span>
                    <span>
                      <b>{member.name}</b>
                      <small>{member.email || "\u2014"}</small>
                    </span>
                    <em>{addAssigneeLabel}</em>
                  </button>
                )) : <EmptyState title={noProjectMembersLabel} />}
                {projectMembers.length && !filteredMembers.length ? <EmptyState title={copy.noData} /> : null}
              </div>

              <div className="task-selected-assignees">
                <div className="task-selected-assignees__title">
                  <span>{selectedAssigneesLabel}</span>
                  <b>{selectedAssignees.length}</b>
                </div>
                {selectedAssignees.length ? selectedAssignees.map((assignee) => (
                  <span className="task-assignee-chip" key={assignee.id}>
                    <span className="task-assignee-avatar" aria-hidden="true">{assignee.name.slice(0, 1).toUpperCase()}</span>
                    <span>
                      <b>{assignee.name}</b>
                      <small>{assignee.email || "\u2014"}</small>
                    </span>
                    <button aria-label={`${removeAssigneeLabel}: ${assignee.name}`} disabled={loading} onClick={() => removeAssignee(assignee.id)} type="button">
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </span>
                )) : <p>{noAssigneesLabel}</p>}
              </div>
            </>
          ) : null}
        </section>

        <TaskField className="task-create-field--description" icon={FiFileText} label={descriptionLabel}>
          <textarea disabled={loading} rows="3" value={form.description} onChange={(event) => setField("description", event.target.value)} />
        </TaskField>

        <TaskField error={fieldErrors.due_date} icon={FiCalendar} label={dueDateLabel}>
          <input
            aria-invalid={Boolean(fieldErrors.due_date)}
            disabled={loading}
            type="date"
            value={form.due_date}
            onChange={(event) => setField("due_date", event.target.value)}
          />
        </TaskField>
      </div>

      <footer className="task-create-footer">
        <Button disabled={loading || projectsStatus === "loading" || projects.length === 0} loading={loading} loadingLabel={loadingLabel} type="submit">{createLabel}</Button>
        <Button disabled={loading} onClick={onCancel} tone="secondary">{cancelLabel}</Button>
      </footer>
    </form>
  );
}
