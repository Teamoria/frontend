import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiBell, FiRefreshCw } from "react-icons/fi";
import { listNotifications } from "../../lib/api.js";
import { usePreferences } from "../../lib/PreferencesContext.jsx";
import { appCopy, routeMeta, textFor } from "../appData.js";
import { Button, EmptyState, ErrorState, LoadingState, PageHeader, Panel } from "../ui.jsx";
import NotificationFilters from "./notifications/NotificationFilters.jsx";
import NotificationList from "./notifications/NotificationList.jsx";
import { buildNotificationQuery, normalizeNotificationsPayload } from "./notifications/notificationHelpers.js";
import "./notifications/notifications.css";

const localCopy = {
  ar: {
    all: "All",
    empty: "No notifications were returned by the API.",
    filterLabel: "Notification status",
    pageStatus: "Page",
    perPage: "Per page",
    read: "Read",
    records: "records",
    system: "System",
    unread: "Unread",
    unreadCount: "Unread"
  },
  en: {
    all: "All",
    empty: "No notifications were returned by the API.",
    filterLabel: "Notification status",
    pageStatus: "Page",
    perPage: "Per page",
    read: "Read",
    records: "records",
    system: "System",
    unread: "Unread",
    unreadCount: "Unread"
  }
};

function normalizePagination(pagination, page, perPage, rowCount) {
  return {
    currentPage: Number(pagination?.currentPage ?? page) || 1,
    lastPage: Math.max(1, Number(pagination?.lastPage ?? 1) || 1),
    perPage: Number(pagination?.perPage ?? perPage) || perPage,
    total: Number(pagination?.total ?? rowCount) || 0
  };
}

function PaginationControls({ copy, local, onNext, onPrevious, page, totalPages }) {
  return (
    <nav aria-label="Pagination" className="notifications-pagination">
      <Button disabled={page <= 1} icon={FiArrowLeft} onClick={onPrevious} tone="secondary">{copy.previous || "Previous"}</Button>
      <span>{local.pageStatus} {page} / {totalPages}</span>
      <Button disabled={page >= totalPages} icon={FiArrowRight} onClick={onNext} tone="secondary">{copy.next || "Next"}</Button>
    </nav>
  );
}

function useNotificationRows({ page, perPage, status }) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [state, setState] = useState({ status: "loading", error: "" });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: "loading", error: "" });

    listNotifications(buildNotificationQuery({ page, perPage, status }))
      .then((payload) => {
        if (!active) return;
        const normalized = normalizeNotificationsPayload(payload, page, perPage);
        setRows(normalized.rows);
        setPagination(normalized.pagination);
        setUnreadCount(normalized.unreadCount);
        setState({ status: "ready", error: "" });
      })
      .catch((requestError) => {
        if (!active) return;
        setRows([]);
        setPagination(null);
        setUnreadCount(0);
        setState({ status: "error", error: requestError?.message || "" });
      });

    return () => { active = false; };
  }, [page, perPage, revision, status]);

  return {
    rows,
    pagination,
    unreadCount,
    status: state.status,
    error: state.error,
    reload: () => setRevision((value) => value + 1)
  };
}

export default function NotificationsResourcePage({ path }) {
  const { language } = usePreferences();
  const copy = appCopy[language] || appCopy.en;
  const local = localCopy[language] || localCopy.en;
  const meta = routeMeta[path] || routeMeta["/notifications"];
  const [statusFilter, setStatusFilter] = useState("all");
  const [perPage, setPerPage] = useState(15);
  const [page, setPage] = useState(1);
  const notifications = useNotificationRows({ page, perPage, status: statusFilter });
  const pagination = useMemo(
    () => normalizePagination(notifications.pagination, page, perPage, notifications.rows.length),
    [notifications.pagination, notifications.rows.length, page, perPage]
  );

  function changeStatus(nextStatus) {
    setStatusFilter(nextStatus);
    setPage(1);
  }

  function changePerPage(nextPerPage) {
    setPerPage(nextPerPage);
    setPage(1);
  }

  return (
    <div className="t2-page notifications-page">
      <PageHeader
        eyebrow={path?.startsWith("/super-admin") ? copy.platform : copy.workspace}
        title={textFor(language, meta.title)}
        subtitle={textFor(language, meta.subtitle)}
      />

      <NotificationFilters
        copy={copy}
        disabled={notifications.status === "loading"}
        local={local}
        onPerPageChange={changePerPage}
        onRefresh={notifications.reload}
        onStatusChange={changeStatus}
        perPage={perPage}
        status={statusFilter}
      />

      <section className="notifications-summary" aria-label={copy.notifications}>
        <article>
          <span aria-hidden="true"><FiBell /></span>
          <div>
            <strong>{pagination.total}</strong>
            <small>{local.records}</small>
          </div>
        </article>
        <article>
          <span aria-hidden="true"><FiBell /></span>
          <div>
            <strong>{notifications.unreadCount}</strong>
            <small>{local.unreadCount}</small>
          </div>
        </article>
      </section>

      {notifications.status === "loading" ? <Panel><LoadingState label={copy.loading} /></Panel> : null}
      {notifications.status === "error" ? (
        <Panel>
          <ErrorState onRetry={notifications.reload} retryLabel={copy.retry} title={notifications.error || copy.failedLoad} />
        </Panel>
      ) : null}
      {notifications.status === "ready" && !notifications.rows.length ? (
        <Panel>
          <EmptyState title={local.empty} action={<Button icon={FiRefreshCw} onClick={notifications.reload} tone="secondary">{copy.retry}</Button>} />
        </Panel>
      ) : null}
      {notifications.status === "ready" && notifications.rows.length ? (
        <Panel className="notifications-panel">
          <NotificationList language={language} local={local} notifications={notifications.rows} />
        </Panel>
      ) : null}
      {notifications.status === "ready" && pagination.lastPage > 1 ? (
        <PaginationControls
          copy={copy}
          local={local}
          page={pagination.currentPage}
          totalPages={pagination.lastPage}
          onNext={() => setPage((current) => Math.min(pagination.lastPage, current + 1))}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        />
      ) : null}
    </div>
  );
}
