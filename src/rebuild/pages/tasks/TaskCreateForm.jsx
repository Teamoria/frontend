import { useEffect, useState } from "react";
import { FiCalendar, FiCheckSquare, FiFileText, FiFlag, FiFolder, FiType } from "react-icons/fi";
import { createTask, getPayloadData } from "../../../lib/api.js";
import { isDemoMode } from "../../../lib/demoMode.js";
import { textFor } from "../../appData.js";
import { Button } from "../../ui.jsx";
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

export default function TaskCreateForm({ copy, language, onCancel, onSaved, projects, projectsStatus, role }) {
  const createLabel = textFor(language, { ar: "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0647\u0645\u0629", en: "Create task" });
  const cancelLabel = textFor(language, { ar: "\u0625\u0644\u063a\u0627\u0621", en: "Cancel" });
  const descriptionLabel = textFor(language, { ar: "\u0627\u0644\u0648\u0635\u0641", en: "Description" });
  const dueDateLabel = textFor(language, { ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0633\u062a\u062d\u0642\u0627\u0642", en: "Due date" });
  const loadingLabel = textFor(language, { ar: "\u062c\u0627\u0631\u064a \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0647\u0645\u0629", en: "Creating task" });
  const projectLabel = textFor(language, { ar: "\u0627\u0644\u0645\u0634\u0631\u0648\u0639", en: "Project" });
  const requiredProjectMessage = textFor(language, { ar: "\u062d\u062f\u062f \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0642\u0628\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0647\u0645\u0629.", en: "Select a project before creating the task." });
  const requiredTitleMessage = textFor(language, { ar: "\u0623\u062f\u062e\u0644 \u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0647\u0645\u0629.", en: "Enter a task title." });
  const invalidDueDateMessage = textFor(language, { ar: "\u0623\u062f\u062e\u0644 \u062a\u0627\u0631\u064a\u062e \u0627\u0633\u062a\u062d\u0642\u0627\u0642 \u0635\u062d\u064a\u062d.", en: "Enter a valid due date." });
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

  useEffect(() => {
    if (!form.project_id && projects[0]?.id) {
      setForm((current) => ({ ...current, project_id: projects[0].id }));
    }
  }, [form.project_id, projects]);

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
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
      onSaved(data?.task || data);
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
            onChange={(event) => setField("project_id", event.target.value)}
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
