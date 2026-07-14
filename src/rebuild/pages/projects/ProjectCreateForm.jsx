import { useMemo, useState } from "react";
import { FiActivity, FiCalendar, FiFileText, FiFlag, FiFolder, FiTrendingUp } from "react-icons/fi";
import { createCompanyProject, getPayloadData } from "../../../lib/api.js";
import { isDemoMode } from "../../../lib/demoMode.js";
import { localizedStatus, textFor } from "../../appData.js";
import { Button } from "../../ui.jsx";
import "./projects.css";
import { getDefaultProjectDates, projectStatusOptions } from "./projectHelpers.js";

function ProjectField({ children, className = "", error, icon: Icon, label, required = false }) {
  return (
    <label className={`project-create-field ${error ? "is-invalid" : ""} ${className}`.trim()}>
      <span className="project-create-field__label">
        {Icon ? <Icon aria-hidden="true" /> : null}
        <span>{label}{required ? <b aria-hidden="true">*</b> : null}</span>
      </span>
      {children}
      {error ? <small className="project-create-field__error" role="alert">{error}</small> : null}
    </label>
  );
}

function firstValidationMessage(validationErrors, key) {
  const value = validationErrors?.[key];
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export default function ProjectCreateForm({ copy, language, onCancel, onSaved }) {
  const projectDates = useMemo(() => getDefaultProjectDates(), []);
  const cancelLabel = textFor(language, { ar: "\u0625\u0644\u063a\u0627\u0621", en: "Cancel" });
  const createLabel = textFor(language, { ar: "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0634\u0631\u0648\u0639", en: "Create project" });
  const descriptionRequiredMessage = textFor(language, { ar: "\u0623\u062f\u062e\u0644 \u0648\u0635\u0641\u0627\u064b \u0645\u062e\u062a\u0635\u0631\u0627\u064b \u0644\u0644\u0645\u0634\u0631\u0648\u0639.", en: "Enter a short project description." });
  const endBeforeStartMessage = textFor(language, { ar: "\u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621 \u0628\u0639\u062f \u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0628\u062f\u0621.", en: "End date must be after the start date." });
  const startLabel = textFor(language, { ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0628\u062f\u0621", en: "Start date" });
  const endLabel = textFor(language, { ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621", en: "End date" });
  const invalidDateMessage = textFor(language, { ar: "\u0623\u062f\u062e\u0644 \u062a\u0648\u0627\u0631\u064a\u062e \u0635\u062d\u064a\u062d\u0629 \u0644\u0644\u0645\u0634\u0631\u0648\u0639.", en: "Enter valid project dates." });
  const loadingLabel = textFor(language, { ar: "\u062c\u0627\u0631\u064a \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0634\u0631\u0648\u0639", en: "Creating project" });
  const nameRequiredMessage = textFor(language, { ar: "\u0623\u062f\u062e\u0644 \u0627\u0633\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639.", en: "Enter a project name." });
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "active",
    progress: 0,
    start_date: projectDates.start_date,
    end_date: projectDates.end_date
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = nameRequiredMessage;
    if (!form.description.trim()) nextErrors.description = descriptionRequiredMessage;
    if (!form.start_date || !form.end_date) {
      nextErrors.start_date = invalidDateMessage;
      nextErrors.end_date = invalidDateMessage;
    } else if (form.end_date < form.start_date) {
      nextErrors.end_date = endBeforeStartMessage;
    }
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
        name: form.name,
        description: form.description,
        status: form.status,
        progress: Number(form.progress || 0),
        start_date: form.start_date,
        end_date: form.end_date
      };
      const payload = isDemoMode() ? { data: { id: `demo-project-${Date.now()}`, ...body } } : await createCompanyProject(body);
      const data = getPayloadData(payload);
      onSaved(data?.project || data);
    } catch (requestError) {
      if (requestError?.validationErrors) {
        setFieldErrors({
          name: firstValidationMessage(requestError.validationErrors, "name"),
          description: firstValidationMessage(requestError.validationErrors, "description"),
          status: firstValidationMessage(requestError.validationErrors, "status"),
          progress: firstValidationMessage(requestError.validationErrors, "progress"),
          start_date: firstValidationMessage(requestError.validationErrors, "start_date"),
          end_date: firstValidationMessage(requestError.validationErrors, "end_date")
        });
      }
      setError(requestError?.message || copy.failedSave);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="project-create-modal" dir={language === "ar" ? "rtl" : "ltr"} onSubmit={submit}>
      {error ? <p className="t2-form-alert is-error" role="alert">{error}</p> : null}
      <div className="project-create-grid">
        <ProjectField className="project-create-field--name" error={fieldErrors.name} icon={FiFolder} label={copy.name} required>
          <input
            aria-invalid={Boolean(fieldErrors.name)}
            disabled={loading}
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
          />
        </ProjectField>

        <ProjectField error={fieldErrors.status} icon={FiFlag} label={copy.status} required>
          <select
            aria-invalid={Boolean(fieldErrors.status)}
            disabled={loading}
            value={form.status}
            onChange={(event) => setField("status", event.target.value)}
          >
            {projectStatusOptions().map((status) => <option key={status} value={status}>{localizedStatus(copy, status)}</option>)}
          </select>
        </ProjectField>

        <ProjectField className="project-create-field--description" error={fieldErrors.description} icon={FiFileText} label={copy.description} required>
          <textarea
            aria-invalid={Boolean(fieldErrors.description)}
            disabled={loading}
            rows="3"
            value={form.description}
            onChange={(event) => setField("description", event.target.value)}
          />
        </ProjectField>

        <ProjectField className="project-create-field--progress" error={fieldErrors.progress} icon={FiTrendingUp} label={copy.progress} required>
          <div className="project-create-progress">
            <input
              aria-invalid={Boolean(fieldErrors.progress)}
              aria-label={copy.progress}
              disabled={loading}
              max="100"
              min="0"
              type="range"
              value={form.progress}
              onChange={(event) => setField("progress", event.target.value)}
            />
            <output>{Number(form.progress || 0)}%</output>
          </div>
        </ProjectField>

        <ProjectField error={fieldErrors.start_date} icon={FiCalendar} label={startLabel} required>
          <input
            aria-invalid={Boolean(fieldErrors.start_date)}
            disabled={loading}
            type="date"
            value={form.start_date}
            onChange={(event) => setField("start_date", event.target.value)}
          />
        </ProjectField>

        <ProjectField error={fieldErrors.end_date} icon={FiActivity} label={endLabel} required>
          <input
            aria-invalid={Boolean(fieldErrors.end_date)}
            disabled={loading}
            min={form.start_date}
            type="date"
            value={form.end_date}
            onChange={(event) => setField("end_date", event.target.value)}
          />
        </ProjectField>
      </div>

      <footer className="project-create-footer">
        <Button disabled={loading} loading={loading} loadingLabel={loadingLabel} type="submit">{createLabel}</Button>
        <Button disabled={loading} onClick={onCancel} tone="secondary">{cancelLabel}</Button>
      </footer>
    </form>
  );
}
