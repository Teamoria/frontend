import { FiCheckCircle, FiEdit3, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { formatDate, ownerName, rowName, textFor } from "../../appData.js";
import { Button, StatusBadge } from "../../ui.jsx";
import { localizedTaskPriority, localizedTaskStatus, taskStatusOptions } from "./taskHelpers.js";

export default function TaskDetails({ actionLoading, archiveMode, copy, language, onArchive, onEdit, onRestore, onStatusChange, task }) {
  const isArchived = archiveMode === "archived" || Boolean(task.deleted_at);
  const editLabel = textFor(language, { ar: "\u062a\u0639\u062f\u064a\u0644", en: "Edit" });
  const archiveLabel = textFor(language, { ar: "\u0623\u0631\u0634\u0641\u0629", en: "Archive" });
  const restoreLabel = textFor(language, { ar: "\u0627\u0633\u062a\u0631\u062c\u0627\u0639", en: "Restore" });
  const dueDateLabel = textFor(language, { ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0633\u062a\u062d\u0642\u0627\u0642", en: "Due date" });

  return (
    <div className="t2-resource-details">
      <span className="t2-resource-details__icon"><FiCheckCircle aria-hidden="true" /></span>
      <div><small>{copy.title}</small><h3>{rowName(task, language)}</h3></div>
      <dl>
        <div><dt>{copy.status}</dt><dd><StatusBadge value={task.status} /></dd></div>
        <div><dt>{copy.priority}</dt><dd>{localizedTaskPriority(copy, task.priority || "medium")}</dd></div>
        <div><dt>{copy.owner}</dt><dd>{ownerName(task, language)}</dd></div>
        <div><dt>{dueDateLabel}</dt><dd>{formatDate(task.due_date, language)}</dd></div>
        <div><dt>{copy.updated}</dt><dd>{formatDate(task.updated_at || task.created_at, language)}</dd></div>
      </dl>
      {task.description ? <p>{task.description}</p> : null}
      <div className="t2-resource-details__actions">
        <Button icon={FiEdit3} onClick={onEdit} tone="secondary">{editLabel}</Button>
        {taskStatusOptions().filter((status) => status !== task.status).map((status) => (
          <Button key={status} loading={actionLoading === status} loadingLabel={copy.loading} onClick={() => onStatusChange(status)} tone="secondary">{localizedTaskStatus(copy, status)}</Button>
        ))}
        {isArchived ? (
          <Button icon={FiRefreshCw} loading={actionLoading === "restore"} loadingLabel={copy.loading} onClick={onRestore} tone="secondary">{restoreLabel}</Button>
        ) : (
          <Button icon={FiTrash2} loading={actionLoading === "archive"} loadingLabel={copy.loading} onClick={onArchive} tone="danger">{archiveLabel}</Button>
        )}
      </div>
    </div>
  );
}
