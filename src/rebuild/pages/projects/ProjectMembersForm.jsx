import { useEffect, useMemo, useState } from "react";
import {
  addCompanyProjectMembers,
  extractRows,
  getCompanyProject,
  getPayloadData,
  listStaff,
  removeCompanyProjectMember
} from "../../../lib/api.js";
import { isDemoMode } from "../../../lib/demoMode.js";
import { demoRows } from "../../appData.js";
import { Button, EmptyState, ErrorState, Field, LoadingState } from "../../ui.jsx";
import { getProjectMemberIds, normalizeStaffOption } from "./projectHelpers.js";
import "./projects.css";

function roleText(role, language) {
  const roles = {
    admin: { ar: "مدير المنصة", en: "Platform admin" },
    company_owner: { ar: "مالك الشركة", en: "Company owner" },
    company_manager: { ar: "مدير الشركة", en: "Company manager" },
    company_member: { ar: "عضو الفريق", en: "Team member" }
  };
  return roles[role]?.[language] || role || "-";
}

function projectRoleText(role, language) {
  const roles = {
    manager: { ar: "مدير المشروع", en: "Project manager" },
    member: { ar: "عضو", en: "Member" },
    viewer: { ar: "مشاهد", en: "Viewer" }
  };
  return roles[role]?.[language] || roles.member[language];
}

export default function ProjectMembersForm({ copy, language, onCancel, onSaved, project, role }) {
  const [staff, setStaff] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => getProjectMemberIds(project));
  const [memberRole, setMemberRole] = useState("member");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [staffRevision, setStaffRevision] = useState(0);
  const currentIds = useMemo(() => getProjectMemberIds(project), [project]);
  const canAssignManager = role === "company_owner";

  useEffect(() => {
    let active = true;
    if (isDemoMode()) {
      const demoStaff = demoRows.employees.map((member) => ({
        id: member.id,
        name: member.nameEn || member.name,
        email: member.email,
        role: member.role
      }));
      setStaff(demoStaff);
      setStatus("ready");
      return () => { active = false; };
    }

    setStatus("loading");
    setError("");
    listStaff()
      .then((payload) => {
        if (!active) return;
        const rows = extractRows(getPayloadData(payload), ["staff", "users", "employees"]).map(normalizeStaffOption).filter((member) => member.id);
        setStaff(rows);
        setStatus("ready");
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError?.message || copy.failedLoad);
        setStatus("error");
      });
    return () => { active = false; };
  }, [copy.failedLoad, staffRevision]);

  function toggleMember(userId) {
    setSelectedIds((current) => current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId]);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const idsToAdd = selectedIds.filter((id) => !currentIds.includes(id));
      const idsToRemove = currentIds.filter((id) => !selectedIds.includes(id));

      if (!isDemoMode() && idsToAdd.length) {
        await addCompanyProjectMembers(project.id, { user_ids: idsToAdd, role: memberRole });
      }
      if (!isDemoMode() && idsToRemove.length) {
        await Promise.all(idsToRemove.map((userId) => removeCompanyProjectMember(project.id, userId)));
      }

      if (isDemoMode()) {
        onSaved({ ...project, members: staff.filter((member) => selectedIds.includes(member.id)) });
      } else {
        const payload = await getCompanyProject(project.id);
        const data = getPayloadData(payload);
        onSaved(data?.project || data);
      }
    } catch (requestError) {
      setError(requestError?.message || copy.failedSave);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="t2-create-form" onSubmit={submit}>
      {error ? <p className="t2-form-alert is-error" role="alert">{error}</p> : null}
      {status === "loading" ? <LoadingState label={copy.loading} /> : null}
      {status === "error" ? <ErrorState onRetry={() => setStaffRevision((value) => value + 1)} retryLabel={copy.retry} title={error || copy.failedLoad} /> : null}
      {status === "ready" ? (
        <>
          <Field label={copy.role}>
            <select value={memberRole} onChange={(event) => setMemberRole(event.target.value)}>
              {canAssignManager ? <option value="manager">{projectRoleText("manager", language)}</option> : null}
              <option value="member">{projectRoleText("member", language)}</option>
              <option value="viewer">{projectRoleText("viewer", language)}</option>
            </select>
          </Field>
          <div className="t2-member-picker">
            {staff.length ? staff.map((member) => (
              <label key={member.id}>
                <input checked={selectedIds.includes(member.id)} type="checkbox" onChange={() => toggleMember(member.id)} />
                <span>{member.name}</span>
                <small>{member.email || roleText(member.role, language)}</small>
              </label>
            )) : <EmptyState title={copy.noData} />}
          </div>
        </>
      ) : null}
      <div className="t2-modal-actions"><Button onClick={onCancel} tone="secondary">{copy.cancel}</Button><Button disabled={status !== "ready"} loading={saving} loadingLabel={copy.loading} type="submit">{copy.save}</Button></div>
    </form>
  );
}
