import { useEffect, useMemo, useState } from "react";
import { FiActivity, FiCalendar, FiFileText, FiFlag, FiFolder, FiSearch, FiTrash2, FiTrendingUp, FiUsers } from "react-icons/fi";
import {
  addCompanyProjectMembers,
  createCompanyProject,
  extractRows,
  getPayloadData,
  listStaff
} from "../../../lib/api.js";
import { isDemoMode } from "../../../lib/demoMode.js";
import { localizedStatus, textFor } from "../../appData.js";
import { Button, EmptyState, ErrorState, LoadingState } from "../../ui.jsx";
import "./projects.css";
import { getDefaultProjectDates, normalizeStaffOption, projectStatusOptions } from "./projectHelpers.js";

const projectRoleOptions = [
  { value: "member" },
  { value: "viewer" }
];

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

export default function ProjectCreateForm({ copy, language, onBusyChange, onCancel, onSaved }) {
  const projectDates = useMemo(() => getDefaultProjectDates(), []);
  const cancelLabel = textFor(language, { ar: "\u0625\u0644\u063a\u0627\u0621", en: "Cancel" });
  const createLabel = textFor(language, { ar: "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0634\u0631\u0648\u0639", en: "Create project" });
  const descriptionRequiredMessage = textFor(language, { ar: "\u0623\u062f\u062e\u0644 \u0648\u0635\u0641\u0627\u064b \u0645\u062e\u062a\u0635\u0631\u0627\u064b \u0644\u0644\u0645\u0634\u0631\u0648\u0639.", en: "Enter a short project description." });
  const endBeforeStartMessage = textFor(language, { ar: "\u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621 \u0628\u0639\u062f \u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0628\u062f\u0621.", en: "End date must be after the start date." });
  const startLabel = textFor(language, { ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0628\u062f\u0621", en: "Start date" });
  const endLabel = textFor(language, { ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621", en: "End date" });
  const invalidDateMessage = textFor(language, { ar: "\u0623\u062f\u062e\u0644 \u062a\u0648\u0627\u0631\u064a\u062e \u0635\u062d\u064a\u062d\u0629 \u0644\u0644\u0645\u0634\u0631\u0648\u0639.", en: "Enter valid project dates." });
  const loadingLabel = textFor(language, { ar: "\u062c\u0627\u0631\u064a \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0634\u0631\u0648\u0639", en: "Creating project" });
  const membersTitle = textFor(language, { ar: "\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0645\u0634\u0631\u0648\u0639", en: "Project members" });
  const membersDescription = textFor(language, { ar: "\u0627\u062e\u062a\u0631 \u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0634\u0631\u0643\u0629 \u0648\u062d\u062f\u062f \u062f\u0648\u0631\u0647\u0645 \u062f\u0627\u062e\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0634\u0631\u0648\u0639.", en: "Add company staff and set their role on this project." });
  const nameRequiredMessage = textFor(language, { ar: "\u0623\u062f\u062e\u0644 \u0627\u0633\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639.", en: "Enter a project name." });
  const noMembersLabel = textFor(language, { ar: "\u0644\u0645 \u064a\u062a\u0645 \u0627\u062e\u062a\u064a\u0627\u0631 \u0623\u0639\u0636\u0627\u0621 \u0628\u0639\u062f.", en: "No members selected yet." });
  const noStaffLabel = textFor(language, { ar: "\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0648\u0638\u0641\u0648\u0646 \u0645\u062a\u0627\u062d\u0648\u0646.", en: "No staff members are available." });
  const searchLabel = textFor(language, { ar: "\u0627\u0628\u062d\u062b \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0628\u0631\u064a\u062f", en: "Search by name or email" });
  const selectedLabel = textFor(language, { ar: "\u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0645\u062d\u062f\u062f\u0648\u0646", en: "Selected members" });
  const addMemberLabel = textFor(language, { ar: "\u0625\u0636\u0627\u0641\u0629 \u0639\u0636\u0648", en: "Add member" });
  const removeMemberLabel = textFor(language, { ar: "\u0625\u0632\u0627\u0644\u0629 \u0639\u0636\u0648", en: "Remove member" });
  const roleLabel = textFor(language, { ar: "\u062f\u0648\u0631 \u0627\u0644\u0645\u0634\u0631\u0648\u0639", en: "Project role" });
  const basicInfoLabel = textFor(language, { ar: "\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629", en: "Basic information" });
  const timelineLabel = textFor(language, { ar: "\u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u0632\u0645\u0646\u064a", en: "Timeline" });
  const partialMembersMessage = textFor(language, {
    ar: "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0628\u0646\u062c\u0627\u062d\u060c \u0644\u0643\u0646 \u062a\u0639\u0630\u0631\u062a \u0625\u0636\u0627\u0641\u0629 \u0628\u0639\u0636 \u0627\u0644\u0623\u0639\u0636\u0627\u0621.",
    en: "Project created successfully, but some members could not be added."
  });
  const roleText = useMemo(() => ({
    member: textFor(language, { ar: "\u0639\u0636\u0648", en: "Member" }),
    viewer: textFor(language, { ar: "\u0645\u0634\u0627\u0647\u062f", en: "Viewer" })
  }), [language]);
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
  const [staff, setStaff] = useState([]);
  const [staffStatus, setStaffStatus] = useState("loading");
  const [staffError, setStaffError] = useState("");
  const [staffRevision, setStaffRevision] = useState(0);
  const [memberQuery, setMemberQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    onBusyChange?.(loading);
    return () => onBusyChange?.(false);
  }, [loading, onBusyChange]);

  useEffect(() => {
    let active = true;
    setStaffStatus("loading");
    setStaffError("");

    if (isDemoMode()) {
      setStaff([]);
      setStaffStatus("ready");
      return () => { active = false; };
    }

    listStaff({ roles: ["company_manager", "company_member"], statuses: ["active"] })
      .then((payload) => {
        if (!active) return;
        const rows = extractRows(getPayloadData(payload), ["staff", "users", "employees"]).map(normalizeStaffOption).filter((member) => member.id);
        setStaff(rows);
        setStaffStatus("ready");
      })
      .catch((requestError) => {
        if (!active) return;
        setStaff([]);
        setStaffError(requestError?.message || copy.failedLoad);
        setStaffStatus("error");
      });

    return () => { active = false; };
  }, [copy.failedLoad, staffRevision]);

  const filteredStaff = useMemo(() => {
    const selectedIds = new Set(selectedMembers.map((member) => member.id));
    const query = memberQuery.trim().toLowerCase();
    return staff
      .filter((member) => !selectedIds.has(member.id))
      .filter((member) => {
        if (!query) return true;
        return [member.name, member.email].join(" ").toLowerCase().includes(query);
      });
  }, [memberQuery, selectedMembers, staff]);

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  function addMember(member) {
    setSelectedMembers((current) => current.some((item) => item.id === member.id) ? current : [...current, { ...member, projectRole: "member" }]);
    setMemberQuery("");
  }

  function removeMember(memberId) {
    setSelectedMembers((current) => current.filter((member) => member.id !== memberId));
  }

  function setProjectRole(memberId, projectRole) {
    setSelectedMembers((current) => current.map((member) => member.id === memberId ? { ...member, projectRole } : member));
  }

  async function assignSelectedMembers(projectId) {
    const groups = selectedMembers.reduce((accumulator, member) => {
      const projectRole = member.projectRole === "viewer" ? "viewer" : "member";
      accumulator[projectRole].push(member.id);
      return accumulator;
    }, { member: [], viewer: [] });

    const failures = [];
    for (const projectRole of ["member", "viewer"]) {
      if (!groups[projectRole].length) continue;
      try {
        await addCompanyProjectMembers(projectId, { user_ids: groups[projectRole], role: projectRole });
      } catch (requestError) {
        failures.push(requestError);
      }
    }

    if (failures.length) {
      const failure = new Error(partialMembersMessage);
      failure.partialMemberFailure = true;
      failure.cause = failures[0];
      throw failure;
    }
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
      const project = data?.project || data;
      const projectId = project?.id || project?.project_id || project?.uuid;
      if (!isDemoMode() && selectedMembers.length && !projectId) {
        onSaved(project, { warning: partialMembersMessage });
        return;
      }
      if (!isDemoMode() && selectedMembers.length && projectId) {
        try {
          await assignSelectedMembers(projectId);
        } catch (memberError) {
          onSaved(project, { warning: memberError?.message || partialMembersMessage });
          return;
        }
      }
      onSaved(project);
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
      <div className="project-create-body">
        <section className="project-create-section">
          <header className="project-create-section__header">
            <span aria-hidden="true"><FiFolder /></span>
            <h3>{basicInfoLabel}</h3>
          </header>
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
          </div>
        </section>

        <section className="project-create-section">
          <header className="project-create-section__header">
            <span aria-hidden="true"><FiCalendar /></span>
            <h3>{timelineLabel}</h3>
          </header>
          <div className="project-create-grid">
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
        </section>

        <section className="project-create-section project-members-section">
          <header className="project-create-section__header">
            <span aria-hidden="true"><FiUsers /></span>
            <div>
              <h3>{membersTitle}</h3>
              <p>{membersDescription}</p>
            </div>
          </header>

          {staffStatus === "loading" ? <LoadingState label={copy.loading} /> : null}
          {staffStatus === "error" ? <ErrorState onRetry={() => setStaffRevision((value) => value + 1)} retryLabel={copy.retry} title={staffError || copy.failedLoad} /> : null}
          {staffStatus === "ready" ? (
            <>
              <label className="project-member-search">
                <FiSearch aria-hidden="true" />
                <span className="t2-sr-only">{searchLabel}</span>
                <input
                  disabled={loading || !staff.length}
                  placeholder={searchLabel}
                  type="search"
                  value={memberQuery}
                  onChange={(event) => setMemberQuery(event.target.value)}
                />
              </label>

              <div className="project-member-options" aria-label={addMemberLabel}>
                {staff.length ? filteredStaff.slice(0, 8).map((member) => (
                  <button disabled={loading} key={member.id} onClick={() => addMember(member)} type="button">
                    <span className="project-member-avatar" aria-hidden="true">{member.name.slice(0, 1).toUpperCase()}</span>
                    <span>
                      <b>{member.name}</b>
                      <small>{member.email || member.role || "\u2014"}</small>
                    </span>
                    <em>{addMemberLabel}</em>
                  </button>
                )) : <EmptyState title={noStaffLabel} />}
                {staff.length && !filteredStaff.length ? <EmptyState title={copy.noData} /> : null}
              </div>

              <div className="project-selected-members">
                <div className="project-selected-members__title">
                  <span>{selectedLabel}</span>
                  <b>{selectedMembers.length}</b>
                </div>
                {selectedMembers.length ? selectedMembers.map((member) => (
                  <article className="project-selected-member" key={member.id}>
                    <span className="project-member-avatar" aria-hidden="true">{member.name.slice(0, 1).toUpperCase()}</span>
                    <div className="project-selected-member__identity">
                      <b>{member.name}</b>
                      <small>{member.email || "\u2014"}</small>
                    </div>
                    <label className="project-role-select">
                      <span>{roleLabel}</span>
                      <select disabled={loading} value={member.projectRole} onChange={(event) => setProjectRole(member.id, event.target.value)}>
                        {projectRoleOptions.map((option) => <option key={option.value} value={option.value}>{roleText[option.value]} ({option.value})</option>)}
                      </select>
                    </label>
                    <button aria-label={`${removeMemberLabel}: ${member.name}`} disabled={loading} onClick={() => removeMember(member.id)} type="button">
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </article>
                )) : <p className="project-selected-members__empty">{noMembersLabel}</p>}
              </div>
            </>
          ) : null}
        </section>
      </div>

      <footer className="project-create-footer">
        <Button disabled={loading} loading={loading} loadingLabel={loadingLabel} type="submit">{createLabel}</Button>
        <Button disabled={loading} onClick={onCancel} tone="secondary">{cancelLabel}</Button>
      </footer>
    </form>
  );
}
