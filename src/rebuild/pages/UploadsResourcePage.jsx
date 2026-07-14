import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiFileText,
  FiGrid,
  FiList,
  FiMoreHorizontal,
  FiRefreshCw,
  FiSearch,
  FiUploadCloud
} from "react-icons/fi";
import {
  extractPagination,
  extractRows,
  getPayloadData,
  listCompanyProjects,
  listStaff,
  listTasks,
  listUploads,
  uploadFiles
} from "../../lib/api.js";
import { useAuth } from "../../lib/AuthContext.jsx";
import { isDemoMode } from "../../lib/demoMode.js";
import { usePreferences } from "../../lib/PreferencesContext.jsx";
import {
  appCopy,
  demoRows,
  formatDate,
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
  Field,
  IconButton,
  Modal,
  PageHeader,
  Panel,
  SelectControl,
  SkeletonTable,
  StatusBadge
} from "../ui.jsx";

const uploadDataKeys = ["uploads", "files", "documents"];
const projectDataKeys = ["projects"];
const taskDataKeys = ["tasks"];
const staffDataKeys = ["staff", "users", "employees"];
const validScopes = ["personal", "company", "project", "task"];
const validVisibility = ["private", "members", "selected"];
const validAccessLevels = ["view", "download"];

const uploadPageCopy = {
  ar: {
    accessLevel: "Access level",
    clearFilters: "Clear filters",
    companyMembers: "Company members",
    createDescription: "Add a file to company knowledge.",
    createTitle: "Upload a file",
    detailTitle: "File details",
    fileDrop: "Choose files from your device",
    fileDropHint: "PDF, DOCX, XLSX, CSV, or TXT within the server file limit.",
    invalidAccess: "Choose a valid access level.",
    invalidScope: "Choose a valid scope.",
    invalidVisibility: "Choose a valid visibility.",
    localSearch: "Search this page",
    noSelectedUsers: "Choose at least one user.",
    private: "Private",
    projectId: "Project",
    records: "records",
    saved: "The file was added to the workspace.",
    scope: "Scope",
    selectedUsers: "Selected users",
    taskId: "Task",
    visibility: "Visibility"
  },
  en: {
    accessLevel: "Access level",
    clearFilters: "Clear filters",
    companyMembers: "Company members",
    createDescription: "Add a file to company knowledge.",
    createTitle: "Upload a file",
    detailTitle: "File details",
    fileDrop: "Choose files from your device",
    fileDropHint: "PDF, DOCX, XLSX, CSV, or TXT within the server file limit.",
    invalidAccess: "Choose a valid access level.",
    invalidScope: "Choose a valid scope.",
    invalidVisibility: "Choose a valid visibility.",
    localSearch: "Search this page",
    noSelectedUsers: "Choose at least one user.",
    private: "Private",
    projectId: "Project",
    records: "records",
    saved: "The file was added to the workspace.",
    scope: "Scope",
    selectedUsers: "Selected users",
    taskId: "Task",
    visibility: "Visibility"
  }
};

function buildUploadQuery(filters, page) {
  return {
    page,
    per_page: filters.perPage,
    scope: filters.scope || undefined,
    visibility: filters.visibility || undefined,
    project_id: filters.projectId || undefined,
    task_id: filters.taskId || undefined
  };
}

function normalizePagination(meta, page, rowCount, perPage) {
  const currentPage = Number(meta?.current_page ?? meta?.currentPage ?? page ?? 1) || 1;
  const lastPage = Number(meta?.last_page ?? meta?.lastPage ?? meta?.pages ?? 1) || 1;
  const total = Number(meta?.total ?? rowCount ?? 0) || 0;
  const normalizedPerPage = Number(meta?.per_page ?? meta?.perPage ?? perPage ?? rowCount ?? 15) || 15;
  return { currentPage, lastPage, total, perPage: normalizedPerPage };
}

function PaginationControls({ copy, disabled, onNext, onPrevious, page, totalPages }) {
  return (
    <nav aria-label="Pagination" className="t2-pagination">
      <Button disabled={disabled || page <= 1} icon={FiArrowLeft} onClick={onPrevious} tone="secondary">{copy.previous || "Previous"}</Button>
      <span>{page} / {totalPages}</span>
      <Button disabled={disabled || page >= totalPages} icon={FiArrowRight} onClick={onNext} tone="secondary">{copy.next || "Next"}</Button>
    </nav>
  );
}

function useUploadRows({ filters, page }) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [state, setState] = useState({ status: "loading", error: "" });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    if (isDemoMode()) {
      setRows(demoRows.uploads);
      setPagination(null);
      setState({ status: "ready", error: "" });
      return () => { active = false; };
    }

    setState({ status: "loading", error: "" });
    listUploads(buildUploadQuery(filters, page))
      .then((payload) => {
        if (!active) return;
        const data = getPayloadData(payload);
        setRows(extractRows(data, uploadDataKeys));
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
  }, [filters.perPage, filters.projectId, filters.scope, filters.taskId, filters.visibility, page, revision]);

  return {
    rows,
    setRows,
    pagination,
    status: state.status,
    error: state.error,
    reload: () => setRevision((value) => value + 1)
  };
}

function useUploadOptions(role) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    let active = true;
    if (isDemoMode()) {
      setProjects(demoRows.projects || []);
      setTasks(demoRows.tasks || []);
      setStaff(demoRows.employees || []);
      return () => { active = false; };
    }

    Promise.allSettled([
      listCompanyProjects({ page: 1 }),
      listTasks({ role, page: 1, per_page: 100 }),
      listStaff({ page: 1 })
    ]).then(([projectResult, taskResult, staffResult]) => {
      if (!active) return;
      setProjects(projectResult.status === "fulfilled" ? extractRows(getPayloadData(projectResult.value), projectDataKeys).filter((row) => row.id) : []);
      setTasks(taskResult.status === "fulfilled" ? extractRows(getPayloadData(taskResult.value), taskDataKeys).filter((row) => row.id) : []);
      setStaff(staffResult.status === "fulfilled" ? extractRows(getPayloadData(staffResult.value), staffDataKeys).filter((row) => row.id) : []);
    });

    return () => { active = false; };
  }, [role]);

  return { projects, tasks, staff };
}

export default function UploadsResourcePage({ path }) {
  const { normalizedRole } = useAuth();
  const { language } = usePreferences();
  const copy = appCopy[language] || appCopy.en;
  const local = uploadPageCopy[language] || uploadPageCopy.en;
  const meta = routeMeta[path] || routeMeta["/uploads"];
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ scope: "", visibility: "", projectId: "", taskId: "", perPage: 15 });
  const [page, setPage] = useState(1);
  const [view, setView] = useState(() => window.matchMedia?.("(max-width: 700px)").matches ? "grid" : "table");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const options = useUploadOptions(normalizedRole);
  const uploads = useUploadRows({ filters, page });

  const filteredRows = useMemo(() => uploads.rows.filter((row) => {
    const searchable = `${rowName(row, language)} ${ownerName(row, language)} ${row.type || ""} ${row.mime_type || ""} ${row.category || ""}`.toLowerCase();
    return searchable.includes(query.trim().toLowerCase());
  }), [language, query, uploads.rows]);

  const pagination = normalizePagination(uploads.pagination, page, uploads.rows.length, filters.perPage);
  const actionLabel = meta.action ? copy[meta.action] : "";
  const totalLabel = pagination.total ? `${filteredRows.length} / ${pagination.total}` : filteredRows.length;

  function updateFilter(key, value) {
    setPage(1);
    setFilters((current) => sanitizeListFilters({ ...current, [key]: value }));
  }

  function resetFilters() {
    setQuery("");
    setPage(1);
    setFilters({ scope: "", visibility: "", projectId: "", taskId: "", perPage: 15 });
  }

  function handleSaved(row) {
    if (row) uploads.setRows((current) => [row, ...current]);
    setCreateOpen(false);
    setToast(local.saved);
    window.setTimeout(() => setToast(""), 3500);
    if (!isDemoMode()) uploads.reload();
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
          <span className="t2-sr-only">{local.localSearch}</span>
          <input placeholder={local.localSearch} type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <SelectControl label={local.scope} value={filters.scope} onChange={(event) => updateFilter("scope", event.target.value)}>
          <option value="">{copy.all}</option>
          {validScopes.map((scope) => <option key={scope} value={scope}>{scope}</option>)}
        </SelectControl>
        <SelectControl label={local.visibility} value={filters.visibility} onChange={(event) => updateFilter("visibility", event.target.value)}>
          <option value="">{copy.all}</option>
          {validVisibility.map((visibility) => <option key={visibility} value={visibility}>{visibilityLabel(visibility, local)}</option>)}
        </SelectControl>
        <SelectControl label={local.projectId} value={filters.projectId} onChange={(event) => updateFilter("projectId", event.target.value)}>
          <option value="">{local.projectId}</option>
          {options.projects.map((project) => <option key={project.id} value={project.id}>{rowName(project, language)}</option>)}
        </SelectControl>
        <SelectControl label={local.taskId} value={filters.taskId} onChange={(event) => updateFilter("taskId", event.target.value)}>
          <option value="">{local.taskId}</option>
          {options.tasks.map((task) => <option key={task.id} value={task.id}>{rowName(task, language)}</option>)}
        </SelectControl>
        <SelectControl label="Per page" value={filters.perPage} onChange={(event) => updateFilter("perPage", Number(event.target.value))}>
          {[15, 25, 50].map((value) => <option key={value} value={value}>{value}</option>)}
        </SelectControl>
        <span className="t2-resource-count">{totalLabel} {local.records}</span>
        <div className="t2-view-toggle" role="group" aria-label={copy.view}>
          <IconButton className={view === "table" ? "is-active" : ""} label={copy.tableView} onClick={() => setView("table")}><FiList /></IconButton>
          <IconButton className={view === "grid" ? "is-active" : ""} label={copy.gridView} onClick={() => setView("grid")}><FiGrid /></IconButton>
        </div>
      </div>

      {uploads.status === "loading" ? <Panel><SkeletonTable rows={6} /></Panel> : null}
      {uploads.status === "error" ? <Panel><ErrorState onRetry={uploads.reload} retryLabel={copy.retry} title={uploads.error || copy.failedLoad} /></Panel> : null}
      {uploads.status === "ready" && !filteredRows.length ? (
        <Panel><EmptyState title={copy.noData} action={query || hasActiveFilters(filters) ? <Button icon={FiRefreshCw} onClick={resetFilters} tone="secondary">{local.clearFilters}</Button> : actionLabel ? <AddButton onClick={() => setCreateOpen(true)}>{actionLabel}</AddButton> : null} /></Panel>
      ) : null}
      {uploads.status === "ready" && filteredRows.length && view === "table" ? <UploadsTable copy={copy} language={language} onSelect={setSelected} rows={filteredRows} /> : null}
      {uploads.status === "ready" && filteredRows.length && view === "grid" ? <UploadsGrid copy={copy} language={language} onSelect={setSelected} rows={filteredRows} /> : null}
      {uploads.status === "ready" && pagination.lastPage > 1 ? (
        <PaginationControls
          copy={copy}
          disabled={uploads.status === "loading"}
          page={pagination.currentPage}
          totalPages={pagination.lastPage}
          onNext={() => setPage((current) => Math.min(pagination.lastPage, current + 1))}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        />
      ) : null}

      <Modal description={local.createDescription} onClose={() => setCreateOpen(false)} open={createOpen} title={actionLabel || local.createTitle}>
        <UploadCreateForm copy={copy} local={local} onCancel={() => setCreateOpen(false)} onSaved={handleSaved} options={options} />
      </Modal>

      <Modal onClose={() => setSelected(null)} open={Boolean(selected)} title={local.detailTitle || copy.details}>
        {selected ? <UploadDetails copy={copy} language={language} row={selected} /> : null}
      </Modal>
    </div>
  );
}

function UploadsTable({ copy, language, onSelect, rows }) {
  const columns = [
    { key: "name", label: copy.name },
    { key: "scope", label: "Scope" },
    { key: "visibility", label: "Visibility" },
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
              <tr key={uploadKey(row, language)}>
                {columns.map((column) => <td key={column.key}>{renderUploadCell(column.key, row, language)}</td>)}
                <td className="t2-table__actions"><IconButton label={`${copy.details}: ${rowName(row, language)}`} onClick={() => onSelect(row)}><FiMoreHorizontal /></IconButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function UploadsGrid({ copy, language, onSelect, rows }) {
  return (
    <div className="t2-resource-grid">
      {rows.map((row) => (
        <article className="t2-resource-card" key={uploadKey(row, language)}>
          <header><span><FiFileText aria-hidden="true" /></span><StatusBadge value={row.processing_status || row.status} /></header>
          <h2>{rowName(row, language)}</h2>
          <p>{[row.scope, row.visibility, row.type || row.mime_type || row.category || row.size || row.file_size].filter(Boolean).join(" - ")}</p>
          <footer><small>{formatDate(row.updated_at || row.created_at, language)}</small><Button onClick={() => onSelect(row)} tone="ghost">{copy.details}</Button></footer>
        </article>
      ))}
    </div>
  );
}

function UploadCreateForm({ copy, local, onCancel, onSaved, options }) {
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    scope: "company",
    visibility: "private",
    projectId: "",
    taskId: "",
    sharedUserIds: [],
    accessLevel: "view"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function setFormValue(key, value) {
    setForm((current) => sanitizeUploadForm({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  }

  function toggleUser(userId) {
    setForm((current) => {
      const selected = current.sharedUserIds.includes(userId)
        ? current.sharedUserIds.filter((id) => id !== userId)
        : [...current.sharedUserIds, userId];
      return { ...current, sharedUserIds: selected };
    });
    setFieldErrors((current) => ({ ...current, sharedUserIds: "" }));
  }

  async function submit(event) {
    event.preventDefault();
    if (loading) return;

    const nextErrors = validateUploadForm(form, files, local);
    setFieldErrors(nextErrors);
    setError("");
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const payload = await uploadFiles(buildUploadPayload(form, files));
      const data = getPayloadData(payload);
      const created = Array.isArray(data?.files) ? data.files[0] : data?.upload || data?.file || data;
      onSaved(created && typeof created === "object" ? created : null);
    } catch (requestError) {
      if (isDemoMode()) {
        onSaved({ id: `demo-${Date.now()}`, name: files[0]?.name, type: files[0]?.type || "File", size: files[0]?.size, scope: form.scope, visibility: form.visibility, status: "pending", updated_at: new Date().toISOString() });
      } else {
        setFieldErrors(mapValidationErrors(requestError?.validationErrors));
        setError(requestError?.message || copy.failedSave);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="t2-create-form" onSubmit={submit}>
      {error ? <p className="t2-form-alert is-error" role="alert">{error}</p> : null}
      <Field error={fieldErrors.files} hint={local.fileDropHint} label={local.fileDrop} required>
        <label className="t2-file-input">
          <FiUploadCloud aria-hidden="true" />
          <span>{files.length ? files.map((file) => file.name).join(", ") : local.fileDrop}</span>
          <input accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" multiple onChange={(event) => { setFiles(Array.from(event.target.files || [])); setFieldErrors((current) => ({ ...current, files: "" })); }} type="file" />
        </label>
      </Field>
      <Field error={fieldErrors.scope} label={local.scope} required>
        <select value={form.scope} onChange={(event) => setFormValue("scope", event.target.value)}>
          {validScopes.map((scope) => <option key={scope} value={scope}>{scope}</option>)}
        </select>
      </Field>
      {form.scope === "project" || form.scope === "task" ? (
        <Field error={fieldErrors.projectId} label={local.projectId} required>
          <select value={form.projectId} onChange={(event) => setFormValue("projectId", event.target.value)}>
            <option value="">{local.projectId}</option>
            {options.projects.map((project) => <option key={project.id} value={project.id}>{rowName(project, "en")}</option>)}
          </select>
        </Field>
      ) : null}
      {form.scope === "task" ? (
        <Field error={fieldErrors.taskId} label={local.taskId} required>
          <select value={form.taskId} onChange={(event) => setFormValue("taskId", event.target.value)}>
            <option value="">{local.taskId}</option>
            {options.tasks.map((task) => <option key={task.id} value={task.id}>{rowName(task, "en")}</option>)}
          </select>
        </Field>
      ) : null}
      <Field error={fieldErrors.visibility} label={local.visibility} required>
        <select value={form.visibility} onChange={(event) => setFormValue("visibility", event.target.value)}>
          {validVisibility.map((visibility) => <option key={visibility} value={visibility}>{visibilityLabel(visibility, local)}</option>)}
        </select>
      </Field>
      {form.visibility === "selected" ? (
        <>
          <Field error={fieldErrors.accessLevel} label={local.accessLevel} required>
            <select value={form.accessLevel} onChange={(event) => setFormValue("accessLevel", event.target.value)}>
              {validAccessLevels.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
          </Field>
          <Field error={fieldErrors.sharedUserIds} label={local.selectedUsers} required>
            <div className="t2-check-list">
              {options.staff.map((user) => (
                <label key={user.id}>
                  <input checked={form.sharedUserIds.includes(String(user.id))} type="checkbox" onChange={() => toggleUser(String(user.id))} />
                  <span>{rowName(user, "en")} {user.email ? `(${user.email})` : ""}</span>
                </label>
              ))}
            </div>
          </Field>
        </>
      ) : null}
      <div className="t2-modal-actions"><Button onClick={onCancel} tone="secondary">{copy.cancel}</Button><Button disabled={loading} loading={loading} loadingLabel={copy.loading} type="submit">{copy.create}</Button></div>
    </form>
  );
}

function UploadDetails({ copy, language, row }) {
  return (
    <div className="t2-resource-details">
      <span className="t2-resource-details__icon"><FiFileText aria-hidden="true" /></span>
      <div><small>{copy.name}</small><h3>{rowName(row, language)}</h3></div>
      <dl>
        <div><dt>{copy.status}</dt><dd><StatusBadge value={row.processing_status || row.status} /></dd></div>
        <div><dt>Scope</dt><dd>{row.scope || "-"}</dd></div>
        <div><dt>Visibility</dt><dd>{row.visibility || "-"}</dd></div>
        <div><dt>{copy.size}</dt><dd>{row.size || row.file_size || "-"}</dd></div>
        <div><dt>{copy.updated}</dt><dd>{formatDate(row.updated_at || row.created_at, language)}</dd></div>
      </dl>
      {row.description ? <p>{row.description}</p> : null}
    </div>
  );
}

function sanitizeListFilters(filters) {
  const next = { ...filters, perPage: Number(filters.perPage) || 15 };
  if (next.scope && !validScopes.includes(next.scope)) next.scope = "";
  if (next.visibility && !validVisibility.includes(next.visibility)) next.visibility = "";
  if (!["project", "task"].includes(next.scope)) next.projectId = "";
  if (next.scope !== "task") next.taskId = "";
  return next;
}

function sanitizeUploadForm(form) {
  const next = { ...form };
  if (!validScopes.includes(next.scope)) next.scope = "company";
  if (!validVisibility.includes(next.visibility)) next.visibility = "private";
  if (!["project", "task"].includes(next.scope)) next.projectId = "";
  if (next.scope !== "task") next.taskId = "";
  if (next.visibility !== "selected") next.sharedUserIds = [];
  if (next.visibility !== "selected") next.accessLevel = "view";
  return next;
}

function buildUploadPayload(form, files) {
  const payload = {
    files,
    scope: form.scope,
    visibility: form.visibility
  };

  if (["project", "task"].includes(form.scope)) payload.project_id = form.projectId;
  if (form.scope === "task") payload.task_id = form.taskId;
  if (form.visibility === "selected") {
    payload.shared_with_user_ids = form.sharedUserIds;
    payload.access_level = form.accessLevel;
  }

  return payload;
}

function validateUploadForm(form, files, local) {
  const errors = {};
  if (!files.length) errors.files = local.fileDrop;
  if (!validScopes.includes(form.scope)) errors.scope = local.invalidScope;
  if (!validVisibility.includes(form.visibility)) errors.visibility = local.invalidVisibility;
  if (["project", "task"].includes(form.scope) && !form.projectId) errors.projectId = local.projectId;
  if (form.scope === "task" && !form.taskId) errors.taskId = local.taskId;
  if (form.visibility === "selected" && !form.sharedUserIds.length) errors.sharedUserIds = local.noSelectedUsers;
  if (form.visibility === "selected" && !validAccessLevels.includes(form.accessLevel)) errors.accessLevel = local.invalidAccess;
  return errors;
}

function mapValidationErrors(validationErrors = {}) {
  const mapped = {};
  Object.entries(validationErrors || {}).forEach(([key, value]) => {
    const message = Array.isArray(value) ? value.join(" ") : String(value || "");
    const normalized = key.replace("[]", "");
    if (normalized.startsWith("files")) mapped.files = message;
    else if (normalized === "project_id") mapped.projectId = message;
    else if (normalized === "task_id") mapped.taskId = message;
    else if (normalized === "shared_with_user_ids") mapped.sharedUserIds = message;
    else if (normalized === "access_level") mapped.accessLevel = message;
    else mapped[normalized] = message;
  });
  return mapped;
}

function hasActiveFilters(filters) {
  return Boolean(filters.scope || filters.visibility || filters.projectId || filters.taskId || Number(filters.perPage) !== 15);
}

function visibilityLabel(value, local) {
  if (value === "private") return local.private;
  if (value === "members") return local.companyMembers;
  if (value === "selected") return local.selectedUsers;
  return value;
}

function renderUploadCell(key, row, language) {
  if (key === "name") return <span className="t2-table-name"><b>{rowName(row, language)}</b>{row.description ? <small>{row.description}</small> : null}</span>;
  if (key === "status") return <StatusBadge value={row.processing_status || row.status} />;
  if (key === "updated") return formatDate(row.updated_at || row.created_at, language);
  if (key === "scope") return row.scope || "-";
  if (key === "visibility") return row.visibility || "-";
  return row[key] || "-";
}

function uploadKey(row, language) {
  return row.id || row.uuid || row.upload_id || row.file_id || rowName(row, language);
}
