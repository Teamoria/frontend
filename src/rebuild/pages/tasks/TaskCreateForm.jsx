import { useEffect, useState } from "react";
import { createTask, getPayloadData } from "../../../lib/api.js";
import { isDemoMode } from "../../../lib/demoMode.js";
import { textFor } from "../../appData.js";
import { Button, Field } from "../../ui.jsx";
import { localizedTaskPriority, localizedTaskStatus, taskPriorityOptions, taskStatusOptions } from "./taskHelpers.js";

export default function TaskCreateForm({ copy, language, onCancel, onSaved, projects, projectsStatus, role }) {
  const dueDateLabel = textFor(language, { ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0633\u062a\u062d\u0642\u0627\u0642", en: "Due date" });
  const projectLabel = textFor(language, { ar: "\u0627\u0644\u0645\u0634\u0631\u0648\u0639", en: "Project" });
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

  useEffect(() => {
    if (!form.project_id && projects[0]?.id) {
      setForm((current) => ({ ...current, project_id: projects[0].id }));
    }
  }, [form.project_id, projects]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.project_id) {
      setError(projectLabel);
      return;
    }
    if (!form.title.trim()) {
      setError(copy.title);
      return;
    }

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
    <form className="t2-create-form" onSubmit={submit}>
      {error ? <p className="t2-form-alert is-error" role="alert">{error}</p> : null}
      <Field label={projectLabel} required>
        <select disabled={projectsStatus === "loading" || projects.length === 0} value={form.project_id} onChange={(event) => setForm({ ...form, project_id: event.target.value })}>
          {projects.length ? projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>) : <option value="">{copy.noData}</option>}
        </select>
      </Field>
      <Field label={copy.title} required><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
      <Field label={copy.description}><textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
      <Field label={copy.status}>
        <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
          {taskStatusOptions().map((status) => <option key={status} value={status}>{localizedTaskStatus(copy, status)}</option>)}
        </select>
      </Field>
      <Field label={copy.priority}>
        <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
          {taskPriorityOptions().map((priority) => <option key={priority} value={priority}>{localizedTaskPriority(copy, priority)}</option>)}
        </select>
      </Field>
      <Field label={dueDateLabel}><input type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} /></Field>
      <div className="t2-modal-actions"><Button onClick={onCancel} tone="secondary">{copy.cancel}</Button><Button disabled={projectsStatus === "loading" || projects.length === 0} loading={loading} loadingLabel={copy.loading} type="submit">{copy.create}</Button></div>
    </form>
  );
}
