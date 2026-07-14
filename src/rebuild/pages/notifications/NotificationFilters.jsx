import { FiRefreshCw } from "react-icons/fi";
import { Button, SelectControl } from "../../ui.jsx";
import { notificationStatusFilters, notificationStatusLabel } from "./notificationHelpers.js";

export default function NotificationFilters({
  copy,
  disabled,
  local,
  onPerPageChange,
  onRefresh,
  onStatusChange,
  perPage,
  status
}) {
  return (
    <div className="notifications-toolbar">
      <div className="notifications-status-tabs" role="group" aria-label={local.filterLabel}>
        {notificationStatusFilters.map((item) => (
          <button
            className={status === item ? "is-active" : ""}
            disabled={disabled}
            key={item}
            onClick={() => onStatusChange(item)}
            type="button"
          >
            {notificationStatusLabel(item, local)}
          </button>
        ))}
      </div>
      <div className="notifications-toolbar__controls">
        <SelectControl disabled={disabled} label={local.perPage} value={perPage} onChange={(event) => onPerPageChange(Number(event.target.value))}>
          {[15, 25, 50].map((value) => <option key={value} value={value}>{value}</option>)}
        </SelectControl>
        <Button disabled={disabled} icon={FiRefreshCw} onClick={onRefresh} tone="secondary">{copy.retry}</Button>
      </div>
    </div>
  );
}
