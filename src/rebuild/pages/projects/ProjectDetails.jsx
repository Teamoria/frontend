import { FiEdit3, FiFolder, FiRefreshCw, FiTrash2, FiUsers } from "react-icons/fi";
import { formatDate, ownerName, rowName, textFor } from "../../appData.js";
import { Button, StatusBadge } from "../../ui.jsx";

export default function ProjectDetails({ actionLoading, archiveMode, copy, language, onArchive, onEdit, onMembers, onRestore, row }) {
  const isArchived = archiveMode === "archived" || Boolean(row.deleted_at);
  const editLabel = textFor(language, { ar: "\u062a\u0639\u062f\u064a\u0644", en: "Edit" });
  const membersLabel = textFor(language, { ar: "\u0627\u0644\u0623\u0639\u0636\u0627\u0621", en: "Members" });
  const archiveLabel = textFor(language, { ar: "\u0623\u0631\u0634\u0641\u0629", en: "Archive" });
  const restoreLabel = textFor(language, { ar: "\u0627\u0633\u062a\u0631\u062c\u0627\u0639", en: "Restore" });
  const startLabel = textFor(language, { ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0628\u062f\u0621", en: "Start date" });
  const endLabel = textFor(language, { ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621", en: "End date" });

  return (
    <div className="t2-resource-details">
      <span className="t2-resource-details__icon"><FiFolder aria-hidden="true" /></span>
      <div><small>{copy.name}</small><h3>{rowName(row, language)}</h3></div>
      <dl>
        <div><dt>{copy.status}</dt><dd><StatusBadge value={row.status} /></dd></div>
        <div><dt>{copy.owner}</dt><dd>{ownerName(row, language)}</dd></div>
        <div><dt>{copy.progress}</dt><dd>{Number(row.progress || 0)}%</dd></div>
        <div><dt>{startLabel}</dt><dd>{formatDate(row.start_date, language)}</dd></div>
        <div><dt>{endLabel}</dt><dd>{formatDate(row.end_date, language)}</dd></div>
        <div><dt>{copy.updated}</dt><dd>{formatDate(row.updated_at || row.created_at, language)}</dd></div>
      </dl>
      {row.description ? <p>{row.description}</p> : null}
      <div className="t2-resource-details__actions">
        <Button icon={FiEdit3} onClick={onEdit} tone="secondary">{editLabel}</Button>
        <Button icon={FiUsers} onClick={onMembers} tone="secondary">{membersLabel}</Button>
        {isArchived ? (
          <Button icon={FiRefreshCw} loading={actionLoading === "restore"} loadingLabel={copy.loading} onClick={onRestore} tone="secondary">{restoreLabel}</Button>
        ) : (
          <Button icon={FiTrash2} loading={actionLoading === "archive"} loadingLabel={copy.loading} onClick={onArchive} tone="danger">{archiveLabel}</Button>
        )}
      </div>
    </div>
  );
}
