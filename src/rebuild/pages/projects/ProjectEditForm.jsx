import { useState } from "react";
import { getPayloadData, updateCompanyProject } from "../../../lib/api.js";
import { isDemoMode } from "../../../lib/demoMode.js";
import { localizedStatus, textFor } from "../../appData.js";
import { Button, Field } from "../../ui.jsx";
import { getDefaultProjectDates, projectStatusKey, projectStatusOptions, toDateInputValue } from "./projectHelpers.js";

export default function ProjectEditForm({ copy, language, onCancel, onSaved, project }) {
  const startLabel = textFor(language, { ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0628\u062f\u0621", en: "Start date" });
  const endLabel = textFor(language, { ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621", en: "End date" });
  const [form, setForm] = useState({
    name: project?.name || "",
    description: project?.description || "",
    status: projectStatusKey(project?.status || "active"),
    progress: Number(project?.progress || 0),
    start_date: project?.start_date ? toDateInputValue(new Date(project.start_date)) : getDefaultProjectDates().start_date,
    end_date: project?.end_date ? toDateInputValue(new Date(project.end_date)) : getDefaultProjectDates().end_date
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError(copy.name);
      return;
    }
    if (!form.description.trim()) {
      setError(copy.description);
      return;
    }
    if (!form.start_date || !form.end_date || form.end_date < form.start_date) {
      setError(copy.date);
      return;
    }

    setLoading(true);
    try {
      const body = {
        name: form.name,
        description: form.description,
        status: form.status,
        progress: Number(form.progress || 0),
        start_date: form.start_date,
        end_date: form.end_date
      };
      const payload = isDemoMode() ? { data: { ...project, ...body } } : await updateCompanyProject(project.id, body);
      const data = getPayloadData(payload);
      onSaved(data?.project || data);
    } catch (requestError) {
      setError(requestError?.message || copy.failedSave);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="t2-create-form" onSubmit={submit}>
      {error ? <p className="t2-form-alert is-error" role="alert">{error}</p> : null}
      <Field label={copy.name} required><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
      <Field label={copy.description} required><textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
      <Field label={copy.status} required>
        <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
          {projectStatusOptions().map((status) => <option key={status} value={status}>{localizedStatus(copy, status)}</option>)}
        </select>
      </Field>
      <Field label={copy.progress} required><input max="100" min="0" type="number" value={form.progress} onChange={(event) => setForm({ ...form, progress: event.target.value })} /></Field>
      <Field label={startLabel} required><input type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} /></Field>
      <Field label={endLabel} required><input min={form.start_date} type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} /></Field>
      <div className="t2-modal-actions"><Button onClick={onCancel} tone="secondary">{copy.cancel}</Button><Button loading={loading} loadingLabel={copy.loading} type="submit">{copy.save}</Button></div>
    </form>
  );
}
