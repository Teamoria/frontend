import { FiEdit3, FiRefreshCw, FiTrash2, FiUsers } from "react-icons/fi";
import { formatDate, rowName, textFor } from "../../appData.js";
import { Button, StatusBadge } from "../../ui.jsx";
import { roleText } from "./staffHelpers.js";

export default function StaffDetails({ actionLoading, archiveMode, copy, language, onArchive, onEdit, onForceDelete, onRestore, row }) {
  const isArchived = archiveMode === "archived" || Boolean(row.deleted_at);
  const editLabel = textFor(language, { ar: "\u062a\u0639\u062f\u064a\u0644", en: "Edit" });
  const archiveLabel = textFor(language, { ar: "\u0623\u0631\u0634\u0641\u0629", en: "Archive" });
  const restoreLabel = textFor(language, { ar: "\u0627\u0633\u062a\u0631\u062c\u0627\u0639", en: "Restore" });
  const forceDeleteLabel = textFor(language, { ar: "\u062d\u0630\u0641 \u0646\u0647\u0627\u0626\u064a", en: "Force delete" });

  return (
    <div className="t2-resource-details">
      <span className="t2-resource-details__icon"><FiUsers aria-hidden="true" /></span>
      <div><small>{copy.name}</small><h3>{rowName(row, language)}</h3></div>
      <dl>
        <div><dt>{copy.email}</dt><dd><bdi>{row.email || "—"}</bdi></dd></div>
        <div><dt>{copy.role}</dt><dd>{roleText(row.role, language)}</dd></div>
        <div><dt>{copy.status}</dt><dd><StatusBadge value={row.status} /></dd></div>
        <div><dt>{copy.updated}</dt><dd>{formatDate(row.updated_at || row.created_at, language)}</dd></div>
      </dl>
      <div className="t2-resource-details__actions">
        {!isArchived ? <Button icon={FiEdit3} onClick={onEdit} tone="secondary">{editLabel}</Button> : null}
        {isArchived ? (
          <>
            <Button icon={FiRefreshCw} loading={actionLoading === "restore"} loadingLabel={copy.loading} onClick={onRestore} tone="secondary">{restoreLabel}</Button>
            <Button icon={FiTrash2} loading={actionLoading === "force-delete"} loadingLabel={copy.loading} onClick={onForceDelete} tone="danger">{forceDeleteLabel}</Button>
          </>
        ) : (
          <Button icon={FiTrash2} loading={actionLoading === "archive"} loadingLabel={copy.loading} onClick={onArchive} tone="danger">{archiveLabel}</Button>
        )}
      </div>
    </div>
  );
}
