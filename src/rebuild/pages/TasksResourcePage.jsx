import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiMoreHorizontal, FiRefreshCw, FiSearch } from "react-icons/fi";
import {
  deleteTask,
  extractPagination,
  extractRows,
  getPayloadData,
  getTask,
  listCompanyProjects,
  listTasks,
  restoreTask,
  updateTaskStatus
} from "../../lib/api.js";
import { useAuth } from "../../lib/AuthContext.jsx";
import { isDemoMode } from "../../lib/demoMode.js";
import { usePreferences } from "../../lib/PreferencesContext.jsx";
import { appCopy, demoRows, formatDate, ownerName, routeMeta, rowName, textFor } from "../appData.js";
import {
  AddButton,
  Button,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Modal,
  PageHeader,
  Panel,
  SelectControl,
  SkeletonTable,
  StatusBadge
} from "../ui.jsx";
import TaskCreateForm from "./tasks/TaskCreateForm.jsx";
import TaskDetails from "./tasks/TaskDetails.jsx";
import TaskEditForm from "./tasks/TaskEditForm.jsx";
import { localizedTaskPriority, localizedTaskStatus, taskPriorityOptions, taskStatusOptions } from "./tasks/taskHelpers.js";

const localCopy = {
  ar: {
    clearFilters: "إزالة التصفية",
    createDescription: "أضف المعلومات الأساسية، ويمكن استكمال التفاصيل لاحقًا.",
    detailTitle: "تفاصيل العنصر",
    records: "سجل",
    saved: "تمت إضافة العنصر إلى مساحة العمل."
  },
  en: {
    clearFilters: "Clear filters",
    createDescription: "Add the essentials now. More detail can be added later.",
    detailTitle: "Item details",
    records: "records",
    saved: "The item was added to the workspace."
  }
};

const taskDataKeys = ["tasks"];
const projectDataKeys = ["projects"];

function dataFallback(key) {
  if (key === "projects") return demoRows.projects;
  return demoRows.tasks || [];
}

function normalizePagination(meta, page, rowCount) {
  const currentPage = Number(meta?.current_page ?? meta?.currentPage ?? page ?? 1) || 1;
  const lastPage = Number(meta?.last_page ?? meta?.lastPage ?? meta?.pages ?? 1) || 1;
  const total = Number(meta?.total ?? rowCount ?? 0) || 0;
  return { currentPage, lastPage, total };
}

function PaginationControls({ copy, onNext, onPrevious, page, totalPages }) {
  return (
    <nav aria-label="Pagination" className="t2-pagination">
      <Button disabled={page <= 1} icon={FiArrowLeft} onClick={onPrevious} tone="secondary">{copy.previous || "Previous"}</Button>
      <span>{page} / {totalPages}</span>
      <Button disabled={page >= totalPages} icon={FiArrowRight} onClick={onNext} tone="secondary">{copy.next || "Next"}</Button>
    </nav>
  );
}

function TaskTable({ copy, language, onSelect, rows }) {
  const columns = [
    { key: "name", label: copy.title },
    { key: "owner", label: copy.owner },
    { key: "priority", label: copy.priority },
    { key: "status", label: copy.status },
    { key: "date", label: copy.date }
  ];

  return (
    <Panel className="t2-table-panel">
      <div className="t2-table-scroll">
        <table className="t2-table">
          <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}<th className="t2-table__actions" scope="col"><span className="t2-sr-only">{copy.actions}</span></th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id || row.uuid || row.email || rowName(row, language)}>
                {columns.map((column) => <td key={column.key}>{renderTaskCell(column.key, row, language, copy)}</td>)}
                <td className="t2-table__actions"><IconButton label={`${copy.details}: ${rowName(row, language)}`} onClick={() => onSelect(row)}><FiMoreHorizontal /></IconButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function renderTaskCell(key, row, language, copy) {
  if (key === "name") return <span className="t2-table-name"><b>{rowName(row, language)}</b>{row.description ? <small>{row.description}</small> : null}</span>;
  if (key === "owner") return <span className="t2-person-cell"><i>{ownerName(row, language).slice(0, 1)}</i><span>{ownerName(row, language)}</span></span>;
  if (key === "priority") return <span className={`t2-priority-label is-${row.priority || "medium"}`}>{copy[row.priority] || row.priority || copy.medium}</span>;
  if (key === "status") return <StatusBadge value={row.status} />;
  if (key === "date") return formatDate(row.due_date || row.date, language);
  return row[key] || "—";
}

function useTaskRows({ archived, page, priority, projectId, role, status }) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [state, setState] = useState({ status: "loading", error: "" });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    if (isDemoMode()) {
      setRows(dataFallback("tasks"));
      setPagination(null);
      setState({ status: "ready", error: "" });
      return () => { active = false; };
    }

    setState({ status: "loading", error: "" });
    listTasks({
      role,
      page,
      per_page: 20,
      archived: archived ? "1" : undefined,
      project_id: projectId || undefined,
      "statuses[]": status !== "all" ? [status] : undefined,
      "priorities[]": priority !== "all" ? [priority] : undefined
    })
      .then((payload) => {
        if (!active) return;
        const data = getPayloadData(payload);
        setRows(extractRows(data, taskDataKeys));
        setPagination(extractPagination(data));
        setState({ status: "ready", error: "" });
      })
      .catch((requestError) => {
        if (!active) return;
        setRows([]);
        setPagination(null);
        setState({ status: "error", error: requestError?.message || "" });
      });

    return () => { active = false; };
  }, [archived, page, priority, projectId, revision, role, status]);

  return {
    rows,
    setRows,
    pagination,
    status: state.status,
    error: state.error,
    reload: () => setRevision((value) => value + 1)
  };
}

function useProjectOptions() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    if (isDemoMode()) {
      setRows(dataFallback("projects"));
      setStatus("ready");
      return () => { active = false; };
    }

    setStatus("loading");
    listCompanyProjects({ page: 1 })
      .then((payload) => {
        if (!active) return;
        setRows(extractRows(getPayloadData(payload), projectDataKeys).filter((project) => project.id));
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setRows([]);
        setStatus("error");
      });
    return () => { active = false; };
  }, [revision]);

  return { rows, status, reload: () => setRevision((value) => value + 1) };
}

export default function TasksResourcePage({ path }) {
  const { normalizedRole } = useAuth();
  const { language } = usePreferences();
  const copy = appCopy[language] || appCopy.en;
  const local = localCopy[language] || localCopy.en;
  const meta = routeMeta[path] || routeMeta["/tasks"];
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("");
  const [archiveMode, setArchiveMode] = useState("active");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailStatus, setDetailStatus] = useState("idle");
  const [detailError, setDetailError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast] = useState("");
  const tasks = useTaskRows({
    archived: archiveMode === "archived",
    page,
    priority: priorityFilter,
    projectId: projectFilter,
    role: normalizedRole,
    status: statusFilter
  });
  const projects = useProjectOptions();

  const filteredRows = useMemo(() => tasks.rows.filter((row) => {
    const searchable = [rowName(row, language), ownerName(row, language), row.description, row.priority].join(" ").toLowerCase();
    return searchable.includes(query.trim().toLowerCase());
  }), [language, query, tasks.rows]);

  const pagination = normalizePagination(tasks.pagination, page, tasks.rows.length);

  function resetFilters() {
    setQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setProjectFilter("");
    setArchiveMode("active");
    setPage(1);
  }

  function refreshAfterSave(row) {
    setCreateOpen(false);
    if (row) tasks.setRows((current) => [row, ...current]);
    setToast(local.saved);
    window.setTimeout(() => setToast(""), 3500);
    if (!isDemoMode()) tasks.reload();
  }

  async function openTask(row) {
    setSelected(row);
    setDetailError("");
    if (isDemoMode() || !row?.id) {
      setDetailStatus("ready");
      return;
    }

    setDetailStatus("loading");
    try {
      const payload = await getTask(row.id, { role: normalizedRole });
      const data = getPayloadData(payload);
      setSelected(data?.task || data);
      setDetailStatus("ready");
    } catch (requestError) {
      setDetailError(requestError?.message || copy.failedLoad);
      setDetailStatus("error");
    }
  }

  function handleTaskUpdated(task) {
    setSelected(task);
    setEditOpen(false);
    setToast(copy.successSave);
    window.setTimeout(() => setToast(""), 3500);
    if (task?.id) tasks.setRows((current) => current.map((item) => String(item.id) === String(task.id) ? task : item));
    if (!isDemoMode()) tasks.reload();
  }

  async function changeTaskStatus(status) {
    if (!selected?.id || actionLoading) return;
    setActionLoading(status);
    setDetailError("");
    try {
      const payload = isDemoMode() ? { data: { ...selected, status } } : await updateTaskStatus(selected.id, status, { role: normalizedRole });
      const data = getPayloadData(payload);
      handleTaskUpdated(data?.task || data);
    } catch (requestError) {
      setDetailError(requestError?.message || copy.failedSave);
    } finally {
      setActionLoading("");
    }
  }

  async function archiveTask() {
    if (!selected?.id || actionLoading) return;
    setActionLoading("archive");
    setDetailError("");
    try {
      if (!isDemoMode()) await deleteTask(selected.id, { role: normalizedRole });
      setSelected(null);
      setToast(copy.successSave);
      window.setTimeout(() => setToast(""), 3500);
      tasks.reload();
    } catch (requestError) {
      setDetailError(requestError?.message || copy.failedSave);
    } finally {
      setActionLoading("");
    }
  }

  async function restoreSelectedTask() {
    if (!selected?.id || actionLoading) return;
    setActionLoading("restore");
    setDetailError("");
    try {
      if (!isDemoMode()) await restoreTask(selected.id, { role: normalizedRole });
      setSelected(null);
      setToast(copy.successSave);
      window.setTimeout(() => setToast(""), 3500);
      tasks.reload();
    } catch (requestError) {
      setDetailError(requestError?.message || copy.failedSave);
    } finally {
      setActionLoading("");
    }
  }

  return (
    <div className="t2-page">
      <PageHeader
        title={textFor(language, meta.title)}
        subtitle={textFor(language, meta.subtitle)}
        action={<AddButton onClick={() => setCreateOpen(true)}>{copy.newTask}</AddButton>}
      />

      {toast ? <div className="t2-toast" role="status"><FiCheckCircle aria-hidden="true" /><span>{toast}</span></div> : null}

      <div className="t2-resource-toolbar t2-resource-toolbar--wide">
        <label className="t2-resource-search">
          <FiSearch aria-hidden="true" />
          <span className="t2-sr-only">{copy.search}</span>
          <input placeholder={copy.search} type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <SelectControl label={copy.projects} value={projectFilter} onChange={(event) => { setProjectFilter(event.target.value); setPage(1); }}>
          <option value="">{copy.all}</option>
          {projects.rows.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </SelectControl>
        <SelectControl label={copy.status} value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
          <option value="all">{copy.all}</option>
          {taskStatusOptions().map((status) => <option key={status} value={status}>{localizedTaskStatus(copy, status)}</option>)}
        </SelectControl>
        <SelectControl label={copy.priority} value={priorityFilter} onChange={(event) => { setPriorityFilter(event.target.value); setPage(1); }}>
          <option value="all">{copy.all}</option>
          {taskPriorityOptions().map((priority) => <option key={priority} value={priority}>{localizedTaskPriority(copy, priority)}</option>)}
        </SelectControl>
        <SelectControl label="Archive filter" value={archiveMode} onChange={(event) => { setArchiveMode(event.target.value); setPage(1); }}>
          <option value="active">{copy.active}</option>
          <option value="archived">Archived</option>
        </SelectControl>
        <span className="t2-resource-count">{pagination.total || filteredRows.length} {local.records}</span>
        <IconButton label={copy.retry} onClick={() => { projects.reload(); tasks.reload(); }}><FiRefreshCw /></IconButton>
      </div>

      {tasks.status === "loading" ? <Panel><SkeletonTable rows={6} /></Panel> : null}
      {tasks.status === "error" ? <Panel><ErrorState onRetry={tasks.reload} retryLabel={copy.retry} title={tasks.error || copy.failedLoad} /></Panel> : null}
      {tasks.status === "ready" && !filteredRows.length ? (
        <Panel><EmptyState title={copy.noData} action={query || statusFilter !== "all" || priorityFilter !== "all" || projectFilter || archiveMode !== "active" ? <Button icon={FiRefreshCw} onClick={resetFilters} tone="secondary">{local.clearFilters}</Button> : <AddButton onClick={() => setCreateOpen(true)}>{copy.newTask}</AddButton>} /></Panel>
      ) : null}
      {tasks.status === "ready" && filteredRows.length ? <TaskTable copy={copy} language={language} onSelect={openTask} rows={filteredRows} /> : null}
      {tasks.status === "ready" && pagination.lastPage > 1 ? (
        <PaginationControls
          copy={copy}
          page={pagination.currentPage}
          totalPages={pagination.lastPage}
          onNext={() => setPage((current) => Math.min(pagination.lastPage, current + 1))}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        />
      ) : null}

      <Modal
        description={textFor(language, { ar: "\u0623\u0636\u0641 \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0647\u0645\u0629 \u0648\u062d\u062f\u062f \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0648\u0627\u0644\u0645\u0648\u0639\u062f \u0627\u0644\u0646\u0647\u0627\u0626\u064a", en: "Add task details, then choose the project and deadline" })}
        onClose={() => setCreateOpen(false)}
        open={createOpen}
        title={textFor(language, { ar: "\u0645\u0647\u0645\u0629 \u062c\u062f\u064a\u062f\u0629", en: "New task" })}
      >
        <TaskCreateForm copy={copy} language={language} onCancel={() => setCreateOpen(false)} onSaved={refreshAfterSave} projects={projects.rows} projectsStatus={projects.status} role={normalizedRole} />
      </Modal>

      <Modal onClose={() => setSelected(null)} open={Boolean(selected)} title={local.detailTitle}>
        {detailStatus === "loading" ? <LoadingState label={copy.loading} /> : null}
        {detailStatus === "error" ? <ErrorState onRetry={() => selected && openTask(selected)} retryLabel={copy.retry} title={detailError || copy.failedLoad} /> : null}
        {selected && detailStatus !== "loading" && detailStatus !== "error" ? (
          <>
            {detailError ? <p className="t2-form-alert is-error" role="alert">{detailError}</p> : null}
            <TaskDetails
              actionLoading={actionLoading}
              archiveMode={archiveMode}
              copy={copy}
              language={language}
              onArchive={archiveTask}
              onEdit={() => setEditOpen(true)}
              onRestore={restoreSelectedTask}
              onStatusChange={changeTaskStatus}
              task={selected}
            />
          </>
        ) : null}
      </Modal>

      <Modal onClose={() => setEditOpen(false)} open={editOpen} title={copy.newTask}>
        {selected ? <TaskEditForm copy={copy} language={language} onCancel={() => setEditOpen(false)} onSaved={handleTaskUpdated} role={normalizedRole} task={selected} /> : null}
      </Modal>
    </div>
  );
}
