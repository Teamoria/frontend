import { useMemo, useState } from "react";
import { FiRefreshCw, FiShield, FiTrash2, FiUsers } from "react-icons/fi";
import { Button } from "../../ui.jsx";
import { rowName } from "../../appData.js";

const permissionAccessLevels = ["view", "manage"];

function getPermissionUser(permission) {
  return permission?.user || permission?.member || permission;
}

function getPermissionUserId(permission) {
  const user = getPermissionUser(permission);
  return String(user?.id || permission?.user_id || permission?.id || "");
}

function getPermissionUserName(permission, language) {
  const user = getPermissionUser(permission);
  return rowName(user || permission, language);
}

function getPermissionUserEmail(permission) {
  const user = getPermissionUser(permission);
  return user?.email || permission?.email || "";
}

function getPermissionAccess(permission) {
  return permission?.access_level || permission?.permission?.access_level || permission?.pivot?.access_level || "view";
}

function normalizePermissions(upload) {
  const raw = upload?.shared_with || upload?.permissions || upload?.allowed_users || upload?.shared_users || [];
  return Array.isArray(raw) ? raw : [];
}

export default function UploadPermissions({
  copy,
  language,
  local,
  onRefresh,
  onRemovePermission,
  onSavePermissions,
  staff = [],
  upload
}) {
  const [form, setForm] = useState({ userIds: [], accessLevel: "view" });
  const [saving, setSaving] = useState(false);
  const [removingUserId, setRemovingUserId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldError, setFieldError] = useState("");
  const permissions = useMemo(() => normalizePermissions(upload), [upload]);
  const permissionUserIds = useMemo(() => new Set(permissions.map(getPermissionUserId).filter(Boolean)), [permissions]);
  const availableStaff = staff.filter((user) => user?.id);

  function toggleUser(userId) {
    setForm((current) => ({
      ...current,
      userIds: current.userIds.includes(userId)
        ? current.userIds.filter((id) => id !== userId)
        : [...current.userIds, userId]
    }));
    setFieldError("");
    setSuccess("");
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setError("");
    setSuccess("");
    if (!form.userIds.length) {
      setFieldError(local.permissionsSelectUser);
      return;
    }
    if (!permissionAccessLevels.includes(form.accessLevel)) {
      setFieldError(local.permissionsInvalidAccess);
      return;
    }

    setSaving(true);
    try {
      await onSavePermissions({ user_ids: form.userIds, access_level: form.accessLevel });
      setForm({ userIds: [], accessLevel: "view" });
      setSuccess(local.permissionsSaved);
    } catch (requestError) {
      setError(requestError?.message || copy.failedSave);
    } finally {
      setSaving(false);
    }
  }

  async function remove(userId) {
    if (!userId || removingUserId) return;
    setRemovingUserId(userId);
    setError("");
    setSuccess("");
    try {
      await onRemovePermission(userId);
      setSuccess(local.permissionsRemoved);
    } catch (requestError) {
      setError(requestError?.message || copy.failedSave);
    } finally {
      setRemovingUserId("");
    }
  }

  return (
    <section className="upload-permissions" aria-labelledby="upload-permissions-title">
      <header>
        <div>
          <span aria-hidden="true"><FiShield /></span>
          <div>
            <h3 id="upload-permissions-title">{local.permissionsTitle}</h3>
            <p>{local.permissionsText}</p>
          </div>
        </div>
        <Button icon={FiRefreshCw} onClick={onRefresh} tone="secondary">{copy.retry}</Button>
      </header>

      {success ? <p className="t2-form-alert is-success" role="status">{success}</p> : null}
      {error ? <p className="t2-form-alert is-error" role="alert">{error}</p> : null}

      <div className="upload-permissions__current">
        <h4>{local.permissionsCurrent}</h4>
        {permissions.length ? (
          <div className="upload-permissions__list">
            {permissions.map((permission) => {
              const userId = getPermissionUserId(permission);
              return (
                <article key={userId || getPermissionUserName(permission, language)}>
                  <span aria-hidden="true"><FiUsers /></span>
                  <div>
                    <b>{getPermissionUserName(permission, language)}</b>
                    {getPermissionUserEmail(permission) ? <small>{getPermissionUserEmail(permission)}</small> : null}
                  </div>
                  <strong>{getPermissionAccess(permission)}</strong>
                  {userId ? (
                    <Button
                      disabled={Boolean(removingUserId)}
                      icon={FiTrash2}
                      loading={removingUserId === userId}
                      loadingLabel={copy.loading}
                      onClick={() => remove(userId)}
                      tone="secondary"
                    >
                      {local.remove}
                    </Button>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="upload-permissions__empty">{local.permissionsEmpty}</p>
        )}
      </div>

      <form className="upload-permissions__form" onSubmit={submit}>
        <label>
          <span>{local.accessLevel}</span>
          <select disabled={saving} value={form.accessLevel} onChange={(event) => setForm((current) => ({ ...current, accessLevel: event.target.value }))}>
            {permissionAccessLevels.map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
        </label>

        <fieldset>
          <legend>{local.selectedUsers}</legend>
          {availableStaff.length ? availableStaff.map((user) => {
            const userId = String(user.id);
            return (
              <label key={userId} className={permissionUserIds.has(userId) ? "is-current" : ""}>
                <input checked={form.userIds.includes(userId)} disabled={saving} type="checkbox" onChange={() => toggleUser(userId)} />
                <span>
                  <b>{rowName(user, language)}</b>
                  {user.email ? <small>{user.email}</small> : null}
                </span>
              </label>
            );
          }) : <p>{local.permissionsNoStaff}</p>}
        </fieldset>

        {fieldError ? <small className="upload-permissions__error" role="alert">{fieldError}</small> : null}
        <div>
          <Button disabled={saving || !availableStaff.length} loading={saving} loadingLabel={copy.loading} type="submit">{local.permissionsSave}</Button>
        </div>
      </form>
    </section>
  );
}
