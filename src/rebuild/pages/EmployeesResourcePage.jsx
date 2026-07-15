import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiMoreHorizontal, FiRefreshCw, FiSearch } from "react-icons/fi";
import {
  deleteStaffMember,
  extractPagination,
  extractRows,
  forceDeleteStaffMember,
  getPayloadData,
  getStaffMember,
  listStaff,
  restoreStaffMember
} from "../../lib/api.js";
import { isDemoMode } from "../../lib/demoMode.js";
import { usePreferences } from "../../lib/PreferencesContext.jsx";
import { appCopy, demoRows, formatDate, routeMeta, rowName, textFor } from "../appData.js";
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
import StaffCreateForm from "./employees/StaffCreateForm.jsx";
import StaffDetails from "./employees/StaffDetails.jsx";
import StaffEditForm from "./employees/StaffEditForm.jsx";
import { companyRoleOptions, localizedStaffStatus, roleText, staffStatusOptions } from "./employees/staffHelpers.js";

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

const staffDataKeys = ["staff", "users", "employees"];

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

function StaffTable({ copy, language, onSelect, rows }) {
  const columns = [
    { key: "name", label: copy.name },
    { key: "email", label: copy.email },
    { key: "role", label: copy.role },
    { key: "status", label: copy.status },
    { key: "updated", label: copy.updated }
  ];

  return (
    <Panel className="t2-table-panel">
      <div className="t2-table-scroll">
        <table className="t2-table">
          <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}<th className="t2-table__actions" scope="col"><span className="t2-sr-only">{copy.actions}</span></th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id || row.uuid || row.email || rowName(row, language)}>
                {columns.map((column) => <td key={column.key}>{renderStaffCell(column.key, row, language, copy)}</td>)}
                <td className="t2-table__actions"><IconButton label={`${copy.details}: ${rowName(row, language)}`} onClick={() => onSelect(row)}><FiMoreHorizontal /></IconButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function renderStaffCell(key, row, language) {
  if (key === "name") return <span className="t2-table-name"><b>{rowName(row, language)}</b>{row.description ? <small>{row.description}</small> : null}</span>;
  if (key === "email") return <bdi>{row.email || "—"}</bdi>;
  if (key === "role") return roleText(row.role, language);
  if (key === "status") return <StatusBadge value={row.status} />;
  if (key === "updated") return formatDate(row.updated_at || row.created_at, language);
  return row[key] || "—";
}

function useStaffRows({ archived, page, role, status }) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [state, setState] = useState({ status: "loading", error: "" });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    if (isDemoMode()) {
      setRows(demoRows.employees);
      setPagination(null);
      setState({ status: "ready", error: "" });
      return () => { active = false; };
    }

    setState({ status: "loading", error: "" });
    listStaff({
      page,
      archived,
      roles: role !== "all" ? [role] : undefined,
      statuses: status !== "all" ? [status] : undefined
    })
      .then((payload) => {
        if (!active) return;
        const data = getPayloadData(payload);
        setRows(extractRows(data, staffDataKeys));
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
  }, [archived, page, revision, role, status]);

  return {
    rows,
    setRows,
    pagination,
    status: state.status,
    error: state.error,
    reload: () => setRevision((value) => value + 1)
  };
}

export default function EmployeesResourcePage({ path }) {
  const { language } = usePreferences();
  const copy = appCopy[language] || appCopy.en;
  const local = localCopy[language] || localCopy.en;
  const meta = routeMeta[path] || routeMeta["/employees"];
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [archiveMode, setArchiveMode] = useState("active");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailStatus, setDetailStatus] = useState("idle");
  const [detailError, setDetailError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast] = useState("");
  const staff = useStaffRows({
    archived: archiveMode === "archived",
    page,
    role: roleFilter,
    status: statusFilter
  });

  const filteredRows = useMemo(() => staff.rows.filter((row) => {
    const searchable = [rowName(row, language), row.email, roleText(row.role, language), row.status].join(" ").toLowerCase();
    return searchable.includes(query.trim().toLowerCase());
  }), [language, query, staff.rows]);

  const pagination = normalizePagination(staff.pagination, page, staff.rows.length);
  const actionLabel = meta.action ? copy[meta.action] : "";

  function resetFilters() {
    setQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
    setArchiveMode("active");
    setPage(1);
  }

  function showSavedToast() {
    setToast(copy.successSave);
    window.setTimeout(() => setToast(""), 3500);
  }

  function handleCreated(row) {
    setCreateOpen(false);
    if (row) staff.setRows((current) => [row, ...current]);
    setToast(local.saved);
    window.setTimeout(() => setToast(""), 3500);
    if (!isDemoMode()) staff.reload();
  }

  async function openStaffMember(row) {
    setSelected(row);
    setDetailError("");
    if (isDemoMode() || !row?.id) {
      setDetailStatus("ready");
      return;
    }

    setDetailStatus("loading");
    try {
      const payload = await getStaffMember(row.id);
      const data = getPayloadData(payload);
      setSelected(data?.staff || data?.user || data);
      setDetailStatus("ready");
    } catch (requestError) {
      setDetailError(requestError?.message || copy.failedLoad);
      setDetailStatus("error");
    }
  }

  function handleUpdated(row) {
    setSelected(row);
    setEditOpen(false);
    showSavedToast();
    if (row?.id) staff.setRows((current) => current.map((item) => String(item.id) === String(row.id) ? row : item));
    if (!isDemoMode()) staff.reload();
  }

  async function archiveStaffMember() {
    if (!selected?.id || actionLoading) return;
    setActionLoading("archive");
    setDetailError("");
    try {
      if (!isDemoMode()) await deleteStaffMember(selected.id);
      setSelected(null);
      showSavedToast();
      staff.reload();
    } catch (requestError) {
      setDetailError(requestError?.message || copy.failedSave);
    } finally {
      setActionLoading("");
    }
  }

  async function restoreSelectedStaffMember() {
    if (!selected?.id || actionLoading) return;
    setActionLoading("restore");
    setDetailError("");
    try {
      const payload = isDemoMode() ? { data: selected } : await restoreStaffMember(selected.id);
      const data = getPayloadData(payload);
      setSelected(null);
      showSavedToast();
      staff.reload();
      if (data?.staff || data?.user) staff.setRows((current) => current.map((item) => String(item.id) === String(selected.id) ? (data.staff || data.user) : item));
    } catch (requestError) {
      setDetailError(requestError?.message || copy.failedSave);
    } finally {
      setActionLoading("");
    }
  }

  async function forceDeleteSelectedStaffMember() {
    if (!selected?.id || actionLoading) return;
    setActionLoading("force-delete");
    setDetailError("");
    try {
      if (!isDemoMode()) await forceDeleteStaffMember(selected.id);
      setSelected(null);
      showSavedToast();
      staff.reload();
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
        action={actionLabel ? <AddButton onClick={() => setCreateOpen(true)}>{actionLabel}</AddButton> : null}
      />

      {toast ? <div className="t2-toast" role="status"><FiCheckCircle aria-hidden="true" /><span>{toast}</span></div> : null}

      <div className="t2-resource-toolbar t2-resource-toolbar--wide">
        <label className="t2-resource-search">
          <FiSearch aria-hidden="true" />
          <span className="t2-sr-only">{copy.search}</span>
          <input placeholder={copy.search} type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <SelectControl label={copy.role} value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }}>
          <option value="all">{copy.all}</option>
          {companyRoleOptions().map((role) => <option key={role} value={role}>{roleText(role, language)}</option>)}
        </SelectControl>
        <SelectControl label={copy.status} value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
          <option value="all">{copy.all}</option>
          {staffStatusOptions().map((status) => <option key={status} value={status}>{localizedStaffStatus(copy, status)}</option>)}
        </SelectControl>
        <SelectControl label="Archive filter" value={archiveMode} onChange={(event) => { setArchiveMode(event.target.value); setPage(1); }}>
          <option value="active">{copy.active}</option>
          <option value="archived">Archived</option>
        </SelectControl>
        <span className="t2-resource-count">{pagination.total || filteredRows.length} {local.records}</span>
        <IconButton label={copy.retry} onClick={staff.reload}><FiRefreshCw /></IconButton>
      </div>

      {staff.status === "loading" ? <Panel><SkeletonTable rows={6} /></Panel> : null}
      {staff.status === "error" ? <Panel><ErrorState onRetry={staff.reload} retryLabel={copy.retry} title={staff.error || copy.failedLoad} /></Panel> : null}
      {staff.status === "ready" && !filteredRows.length ? (
        <Panel><EmptyState title={copy.noData} action={query || roleFilter !== "all" || statusFilter !== "all" || archiveMode !== "active" ? <Button icon={FiRefreshCw} onClick={resetFilters} tone="secondary">{local.clearFilters}</Button> : actionLabel ? <AddButton onClick={() => setCreateOpen(true)}>{actionLabel}</AddButton> : null} /></Panel>
      ) : null}
      {staff.status === "ready" && filteredRows.length ? <StaffTable copy={copy} language={language} onSelect={openStaffMember} rows={filteredRows} /> : null}
      {staff.status === "ready" && pagination.lastPage > 1 ? (
        <PaginationControls
          copy={copy}
          page={pagination.currentPage}
          totalPages={pagination.lastPage}
          onNext={() => setPage((current) => Math.min(pagination.lastPage, current + 1))}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        />
      ) : null}

      <Modal description={local.createDescription} onClose={() => setCreateOpen(false)} open={createOpen} title={actionLabel || local.createTitle}>
        <StaffCreateForm copy={copy} language={language} onCancel={() => setCreateOpen(false)} onSaved={handleCreated} />
      </Modal>

      <Modal onClose={() => setSelected(null)} open={Boolean(selected)} title={local.detailTitle}>
        {detailStatus === "loading" ? <LoadingState label={copy.loading} /> : null}
        {detailStatus === "error" ? <ErrorState onRetry={() => selected && openStaffMember(selected)} retryLabel={copy.retry} title={detailError || copy.failedLoad} /> : null}
        {selected && detailStatus !== "loading" && detailStatus !== "error" ? (
          <>
            {detailError ? <p className="t2-form-alert is-error" role="alert">{detailError}</p> : null}
            <StaffDetails
              actionLoading={actionLoading}
              archiveMode={archiveMode}
              copy={copy}
              language={language}
              onArchive={archiveStaffMember}
              onEdit={() => setEditOpen(true)}
              onForceDelete={forceDeleteSelectedStaffMember}
              onRestore={restoreSelectedStaffMember}
              row={selected}
            />
          </>
        ) : null}
      </Modal>

      <Modal onClose={() => setEditOpen(false)} open={editOpen} title={actionLabel || local.createTitle}>
        {selected ? <StaffEditForm copy={copy} language={language} onCancel={() => setEditOpen(false)} onSaved={handleUpdated} row={selected} /> : null}
      </Modal>
    </div>
  );
}
