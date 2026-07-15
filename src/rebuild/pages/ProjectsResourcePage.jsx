import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiFolder, FiGrid, FiList, FiMoreHorizontal, FiRefreshCw, FiSearch } from "react-icons/fi";
import {
  deleteCompanyProject,
  extractPagination,
  extractRows,
  getCompanyProject,
  getPayloadData,
  listCompanyProjects,
  restoreCompanyProject
} from "../../lib/api.js";
import { useAuth } from "../../lib/AuthContext.jsx";
import { isDemoMode } from "../../lib/demoMode.js";
import { usePreferences } from "../../lib/PreferencesContext.jsx";
import {
  appCopy,
  demoRows,
  formatDate,
  localizedStatus,
  ownerName,
  routeMeta,
  rowName,
  textFor
} from "../appData.js";
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
  Progress,
  SelectControl,
  SkeletonTable,
  StatusBadge
} from "../ui.jsx";
import ProjectCreateForm from "./projects/ProjectCreateForm.jsx";
import ProjectDetails from "./projects/ProjectDetails.jsx";
import ProjectEditForm from "./projects/ProjectEditForm.jsx";
import ProjectMembersForm from "./projects/ProjectMembersForm.jsx";
import { projectStatusKey, projectStatusOptions } from "./projects/projectHelpers.js";

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

const projectDataKeys = ["projects"];

function dataFallback() {
  return demoRows.projects || [];
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

function ProjectTable({ copy, language, onSelect, rows }) {
  const columns = [
    { key: "name", label: copy.name },
    { key: "owner", label: copy.owner },
    { key: "status", label: copy.status },
    { key: "progress", label: copy.progress },
    { key: "updated", label: copy.updated }
  ];

  return (
    <Panel className="t2-table-panel">
      <div className="t2-table-scroll">
        <table className="t2-table">
          <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}<th className="t2-table__actions" scope="col"><span className="t2-sr-only">{copy.actions}</span></th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id || row.uuid || rowName(row, language)}>
                {columns.map((column) => <td key={column.key}>{renderProjectCell(column.key, row, language, copy)}</td>)}
                <td className="t2-table__actions"><IconButton label={`${copy.details}: ${rowName(row, language)}`} onClick={() => onSelect(row)}><FiMoreHorizontal /></IconButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ProjectGrid({ copy, language, onSelect, rows }) {
  return (
    <div className="t2-resource-grid">
      {rows.map((row) => (
        <article className="t2-resource-card" key={row.id || row.uuid || rowName(row, language)}>
          <header><span><FiFolder aria-hidden="true" /></span><StatusBadge value={row.status} /></header>
          <h2>{rowName(row, language)}</h2>
          <p>{row.description || ownerName(row, language)}</p>
          {typeof row.progress === "number" ? <div className="t2-resource-card__progress"><Progress label={`${copy.progress}: ${row.progress}%`} value={row.progress} /><small>{row.progress}%</small></div> : null}
          <footer><small>{formatDate(row.updated_at || row.date || row.due_date, language)}</small><Button onClick={() => onSelect(row)} tone="ghost">{copy.details}</Button></footer>
        </article>
      ))}
    </div>
  );
}

function renderProjectCell(key, row, language, copy) {
  if (key === "name") return <span className="t2-table-name"><b>{rowName(row, language)}</b>{row.description ? <small>{row.description}</small> : null}</span>;
  if (key === "owner") return <span className="t2-person-cell"><i>{ownerName(row, language).slice(0, 1)}</i><span>{ownerName(row, language)}</span></span>;
  if (key === "status") return <StatusBadge value={row.status} />;
  if (key === "progress") return <span className="t2-progress-cell"><Progress label={`${copy.progress}: ${row.progress || 0}%`} value={row.progress || 0} /><small>{row.progress || 0}%</small></span>;
  if (key === "updated") return formatDate(row.updated_at || row.created_at, language);
  return row[key] || "—";
}

function useProjectRows({ archived, page }) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    if (isDemoMode()) {
      setRows(dataFallback());
      setPagination(null);
      setStatus("ready");
      setError("");
      return () => { active = false; };
    }

    setStatus("loading");
    setError("");
    listCompanyProjects({ archived, page })
      .then((payload) => {
        if (!active) return;
        const data = getPayloadData(payload);
        setRows(extractRows(data, projectDataKeys));
        setPagination(extractPagination(data));
        setStatus("ready");
      })
      .catch((requestError) => {
        if (!active) return;
        setRows([]);
        setPagination(null);
        setError(requestError?.message || "");
        setStatus("error");
      });

    return () => { active = false; };
  }, [archived, page, revision]);

  return {
    rows,
    setRows,
    pagination,
    status,
    error,
    reload: () => setRevision((value) => value + 1)
  };
}

export default function ProjectsResourcePage({ path }) {
  const { normalizedRole } = useAuth();
  const { language } = usePreferences();
  const copy = appCopy[language] || appCopy.en;
  const local = localCopy[language] || localCopy.en;
  const meta = routeMeta[path] || routeMeta["/projects"];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [archiveMode, setArchiveMode] = useState("active");
  const [view, setView] = useState(() => window.matchMedia?.("(max-width: 700px)").matches ? "grid" : "table");
  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailStatus, setDetailStatus] = useState("idle");
  const [detailError, setDetailError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const projects = useProjectRows({ archived: archiveMode === "archived", page });

  const filteredRows = useMemo(() => projects.rows.filter((row) => {
    const searchable = [
      rowName(row, language),
      ownerName(row, language),
      row.description,
      row.status
    ].join(" ").toLowerCase();
    const matchesQuery = searchable.includes(query.trim().toLowerCase());
    const matchesFilter = filter === "all" || projectStatusKey(row.status) === filter;
    return matchesQuery && matchesFilter;
  }), [filter, language, projects.rows, query]);

  const pagination = normalizePagination(projects.pagination, page, projects.rows.length);
  const actionLabel = meta.action ? copy[meta.action] : "";
  const totalLabel = pagination.total ? `${filteredRows.length} / ${pagination.total}` : filteredRows.length;

  function resetFilters() {
    setQuery("");
    setFilter("all");
    setArchiveMode("active");
    setPage(1);
  }

  function handleArchiveModeChange(event) {
    setArchiveMode(event.target.value);
    setPage(1);
  }

  function handleSaved(row, meta = {}) {
    if (row) projects.setRows((current) => [row, ...current]);
    setCreateOpen(false);
    setToast(meta.warning || local.saved);
    window.setTimeout(() => setToast(""), 3500);
    if (!isDemoMode()) projects.reload();
  }

  async function openProject(row) {
    setSelected(row);
    setDetailError("");
    if (isDemoMode() || !row?.id) {
      setDetailStatus("ready");
      return;
    }

    setDetailStatus("loading");
    try {
      const payload = await getCompanyProject(row.id);
      const data = getPayloadData(payload);
      setSelected(data?.project || data);
      setDetailStatus("ready");
    } catch (requestError) {
      setDetailError(requestError?.message || copy.failedLoad);
      setDetailStatus("error");
    }
  }

  function handleUpdated(row) {
    setSelected(row);
    setEditOpen(false);
    setMembersOpen(false);
    setToast(copy.successSave);
    window.setTimeout(() => setToast(""), 3500);
    if (row?.id) {
      projects.setRows((current) => current.map((item) => String(item.id) === String(row.id) ? row : item));
    }
    if (!isDemoMode()) projects.reload();
  }

  async function handleMembersSaved(project) {
    setMembersOpen(false);
    setToast(copy.successSave);
    window.setTimeout(() => setToast(""), 3500);
    if (project?.id) {
      setSelected(project);
      projects.setRows((current) => current.map((item) => String(item.id) === String(project.id) ? project : item));
    } else if (selected?.id && !isDemoMode()) {
      await openProject(selected);
    }
    if (!isDemoMode()) projects.reload();
  }

  async function archiveProject() {
    if (!selected?.id || actionLoading) return;
    setActionLoading("archive");
    try {
      if (!isDemoMode()) await deleteCompanyProject(selected.id);
      setSelected(null);
      setToast(copy.successSave);
      window.setTimeout(() => setToast(""), 3500);
      projects.reload();
    } catch (requestError) {
      setDetailError(requestError?.message || copy.failedSave);
      setDetailStatus("ready");
    } finally {
      setActionLoading("");
    }
  }

  async function restoreProject() {
    if (!selected?.id || actionLoading) return;
    setActionLoading("restore");
    try {
      if (!isDemoMode()) await restoreCompanyProject(selected.id);
      setSelected(null);
      setToast(copy.successSave);
      window.setTimeout(() => setToast(""), 3500);
      projects.reload();
    } catch (requestError) {
      setDetailError(requestError?.message || copy.failedSave);
      setDetailStatus("ready");
    } finally {
      setActionLoading("");
    }
  }

  return (
    <div className="t2-page">
      <PageHeader
        title={textFor(language, meta.title)}
        subtitle={textFor(language, meta.subtitle)}
        action={actionLabel ? <AddButton onClick={() => setCreateOpen(true)}>{actionLabel}</AddButton> : null}
      />

      {toast ? <div className="t2-toast" role="status"><FiCheckCircle aria-hidden="true" /><span>{toast}</span></div> : null}

      <div className="t2-resource-toolbar">
        <label className="t2-resource-search">
          <FiSearch aria-hidden="true" />
          <span className="t2-sr-only">{copy.search}</span>
          <input placeholder={copy.search} type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <SelectControl label={copy.filters} value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">{copy.all}</option>
          {projectStatusOptions().map((status) => <option key={status} value={status}>{localizedStatus(copy, status)}</option>)}
        </SelectControl>
        <SelectControl label="Archive filter" value={archiveMode} onChange={handleArchiveModeChange}>
          <option value="active">{copy.active}</option>
          <option value="archived">Archived</option>
        </SelectControl>
        <span className="t2-resource-count">{totalLabel} {local.records}</span>
        <IconButton label={copy.retry} onClick={projects.reload}><FiRefreshCw /></IconButton>
        <div className="t2-view-toggle" role="group" aria-label={copy.view}>
          <IconButton className={view === "table" ? "is-active" : ""} label={copy.tableView} onClick={() => setView("table")}><FiList /></IconButton>
          <IconButton className={view === "grid" ? "is-active" : ""} label={copy.gridView} onClick={() => setView("grid")}><FiGrid /></IconButton>
        </div>
      </div>

      {projects.status === "loading" ? <Panel><SkeletonTable rows={6} /></Panel> : null}
      {projects.status === "error" ? <Panel><ErrorState onRetry={projects.reload} retryLabel={copy.retry} title={projects.error || copy.failedLoad} /></Panel> : null}
      {projects.status === "ready" && !filteredRows.length ? (
        <Panel><EmptyState title={copy.noData} action={query || filter !== "all" || archiveMode !== "active" ? <Button icon={FiRefreshCw} onClick={resetFilters} tone="secondary">{local.clearFilters}</Button> : actionLabel ? <AddButton onClick={() => setCreateOpen(true)}>{actionLabel}</AddButton> : null} /></Panel>
      ) : null}
      {projects.status === "ready" && filteredRows.length && view === "table" ? <ProjectTable copy={copy} language={language} onSelect={openProject} rows={filteredRows} /> : null}
      {projects.status === "ready" && filteredRows.length && view === "grid" ? <ProjectGrid copy={copy} language={language} onSelect={openProject} rows={filteredRows} /> : null}
      {projects.status === "ready" && pagination.lastPage > 1 ? (
        <PaginationControls
          copy={copy}
          page={pagination.currentPage}
          totalPages={pagination.lastPage}
          onNext={() => setPage((current) => Math.min(pagination.lastPage, current + 1))}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        />
      ) : null}

      <Modal description={local.createDescription} onClose={() => !createBusy && setCreateOpen(false)} open={createOpen} title={actionLabel || copy.create}>
        <ProjectCreateForm copy={copy} language={language} onBusyChange={setCreateBusy} onCancel={() => setCreateOpen(false)} onSaved={handleSaved} />
      </Modal>

      <Modal onClose={() => setSelected(null)} open={Boolean(selected)} title={local.detailTitle}>
        {detailStatus === "loading" ? <LoadingState label={copy.loading} /> : null}
        {detailStatus === "error" ? <ErrorState onRetry={() => selected && openProject(selected)} retryLabel={copy.retry} title={detailError || copy.failedLoad} /> : null}
        {selected && detailStatus !== "loading" && detailStatus !== "error" ? (
          <>
            {detailError ? <p className="t2-form-alert is-error" role="alert">{detailError}</p> : null}
            <ProjectDetails
              actionLoading={actionLoading}
              archiveMode={archiveMode}
              copy={copy}
              language={language}
              onArchive={archiveProject}
              onEdit={() => setEditOpen(true)}
              onMembers={() => setMembersOpen(true)}
              onRestore={restoreProject}
              row={selected}
            />
          </>
        ) : null}
      </Modal>

      <Modal onClose={() => setEditOpen(false)} open={editOpen} title={actionLabel || copy.create}>
        {selected ? <ProjectEditForm copy={copy} language={language} onCancel={() => setEditOpen(false)} onSaved={handleUpdated} project={selected} /> : null}
      </Modal>

      <Modal onClose={() => setMembersOpen(false)} open={membersOpen} title={copy.employees}>
        {selected ? <ProjectMembersForm copy={copy} language={language} onCancel={() => setMembersOpen(false)} onSaved={handleMembersSaved} project={selected} role={normalizedRole} /> : null}
      </Modal>
    </div>
  );
}
