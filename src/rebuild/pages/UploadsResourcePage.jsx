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
  getUpload,
  getUploadStatus,
  listCompanyProjects,
  listStaff,
  listTasks,
  listUploads,
  deleteUpload,
  deleteUploadPermission,
  downloadUpload,
  previewUpload,
  updateUploadPermissions,
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
import UploadDetails from "./uploads/UploadDetails.jsx";
import UploadProgress from "./uploads/UploadProgress.jsx";
import { formatUploadSize, getProcessingStatus, getUploadId, getUploadName, uploadStatusTone } from "./uploads/uploadStatus.js";
import "./uploads/uploads.css";

const uploadDataKeys = ["uploads", "files", "documents"];
const projectDataKeys = ["projects"];
const taskDataKeys = ["tasks"];
const staffDataKeys = ["staff", "users", "employees"];
const validScopes = ["personal", "company", "project", "task"];
const validVisibility = ["private", "members", "selected"];
const validAccessLevels = ["view", "manage"];

const uploadPageCopy = {
  ar: {
    accessLevel: "مستوى الوصول",
    allFiles: "كل الملفات",
    clearFilters: "إزالة التصفية",
    companyFiles: "ملفات الشركة",
    companyLocation: "مساحة الشركة",
    companyMembers: "أعضاء النطاق",
    createDescription: "أضف ملفًا إلى معرفة الشركة.",
    createTitle: "رفع ملف",
    detailTitle: "تفاصيل الملف",
    fileDrop: "اختر ملفات من جهازك",
    fileDropHint: "PDF أو DOCX أو XLSX أو CSV أو TXT ضمن حد الخادم.",
    createdAt: "تاريخ الإنشاء",
    download: "تنزيل",
    invalidAccess: "اختر مستوى وصول صحيحًا.",
    invalidScope: "اختر نطاقًا صحيحًا.",
    invalidVisibility: "اختر ظهورًا صحيحًا.",
    localSearch: "ابحث في الملفات...",
    location: "الموقع",
    myFiles: "ملفاتي",
    noSelectedUsers: "اختر مستخدمًا واحدًا على الأقل.",
    preview: "معاينة",
    previewUnsupported: "المعاينة غير مدعومة لهذا النوع. يمكن التنزيل إذا سمح الخادم.",
    processingStatus: "حالة المعالجة",
    projectFiles: "ملفات المشاريع",
    projectId: "المشروع",
    allProjects: "كل المشاريع",
    refreshStatus: "تحديث الحالة",
    deleteButton: "حذف الملف",
    deleteConfirm: "حذف",
    deleteConfirmButton: "حذف الملف",
    deleteSuccess: "تم حذف الملف.",
    deleteText: "إزالة هذا الرفع من مساحة العمل. قد يكون هذا الإجراء دائمًا.",
    deleteTitle: "حذف الرفع",
    aiChunk: "مقطع",
    aiChunks: "المقاطع",
    aiDecisions: "القرارات",
    aiEmpty: "اكتملت المعالجة، لكن لا توجد نتيجة AI لهذا الملف.",
    aiFailed: "فشلت معالجة AI",
    aiOverview: "نظرة عامة",
    aiProcessing: "معالجة AI ما زالت قيد التشغيل",
    aiResults: "نتائج AI",
    aiResultsText: "نتائج للقراءة فقط مرتبطة بهذا الرفع.",
    aiSummary: "الملخص",
    aiTasks: "المهام",
    aiTranscript: "النص",
    permissionsCurrent: "الوصول الحالي",
    permissionsEmpty: "لا توجد صلاحيات مستخدمين محددين لهذا الملف.",
    permissionsInvalidAccess: "اختر مستوى وصول موثقًا.",
    permissionsNoStaff: "لا يوجد أعضاء فريق متاحون.",
    permissionsRemoved: "تمت إزالة الصلاحية.",
    permissionsSave: "حفظ الصلاحيات",
    permissionsSaved: "تم تحديث الصلاحيات.",
    permissionsSelectUser: "اختر مستخدمًا واحدًا على الأقل.",
    permissionsText: "امنح مستخدمين محددين من الشركة وصولًا موثقًا لهذا الرفع.",
    permissionsTitle: "الصلاحيات",
    private: "خاص",
    records: "سجل",
    remove: "إزالة",
    saved: "تمت إضافة الملف إلى مساحة العمل.",
    scope: "النطاق",
    selectedSharing: "مشاركة محددة",
    selectedUsers: "مستخدمون محددون",
    sharing: "المشاركة",
    sharedWithMe: "تمت مشاركتها معي",
    taskId: "المهمة",
    unknownLocation: "موقع غير محدد",
    perPage: "لكل صفحة",
    visibility: "الظهور"
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
    createdAt: "Created",
    download: "Download",
    invalidAccess: "Choose a valid access level.",
    invalidScope: "Choose a valid scope.",
    invalidVisibility: "Choose a valid visibility.",
    allFiles: "All Files",
    companyFiles: "Company Files",
    companyLocation: "Company space",
    localSearch: "Search files...",
    location: "Location",
    myFiles: "My Files",
    noSelectedUsers: "Choose at least one user.",
    preview: "Preview",
    previewUnsupported: "Preview is not supported for this file type. Download is available when the server allows it.",
    processingStatus: "Processing status",
    projectFiles: "Project Files",
    refreshStatus: "Refresh status",
    deleteButton: "Delete file",
    deleteConfirm: "Delete",
    deleteConfirmButton: "Delete file",
    deleteSuccess: "The file was deleted.",
    deleteText: "Remove this upload from the workspace. This action may be permanent.",
    deleteTitle: "Delete upload",
    aiChunk: "Chunk",
    aiChunks: "Chunks",
    aiDecisions: "Decisions",
    aiEmpty: "Processing completed, but no AI result is available for this file.",
    aiFailed: "AI processing failed",
    aiOverview: "Overview",
    aiProcessing: "AI processing is still running",
    aiResults: "AI results",
    aiResultsText: "Read-only results returned with this upload.",
    aiSummary: "Summary",
    aiTasks: "Tasks",
    aiTranscript: "Transcript",
    permissionsCurrent: "Current access",
    permissionsEmpty: "No selected-user permissions are attached to this file.",
    permissionsInvalidAccess: "Choose a documented access level.",
    permissionsNoStaff: "No staff members are available.",
    permissionsRemoved: "Permission removed.",
    permissionsSave: "Save permissions",
    permissionsSaved: "Permissions updated.",
    permissionsSelectUser: "Choose at least one user.",
    permissionsText: "Grant selected company users documented access to this upload.",
    permissionsTitle: "Permissions",
    remove: "Remove",
    private: "Private",
    projectId: "Project",
    allProjects: "All Projects",
    records: "records",
    saved: "The file was added to the workspace.",
    scope: "Scope",
    selectedSharing: "Selected sharing",
    selectedUsers: "Selected users",
    sharing: "Sharing",
    sharedWithMe: "Shared With Me",
    taskId: "Task",
    unknownLocation: "Unspecified location",
    perPage: "Per page",
    visibility: "Visibility"
  }
};

const fileCategoryTabs = [
  { key: "all", scope: "", visibility: "", copyKey: "allFiles" },
  { key: "company", scope: "company", visibility: "", copyKey: "companyFiles" },
  { key: "project", scope: "project", visibility: "", copyKey: "projectFiles" },
  { key: "shared", scope: "", visibility: "selected", copyKey: "sharedWithMe" },
  { key: "personal", scope: "personal", visibility: "", copyKey: "myFiles" }
];

function buildUploadQuery(filters, page) {
  const category = fileCategoryTabs.find((item) => item.key === filters.category) || fileCategoryTabs[0];
  const scope = category.scope || "";
  const visibility = category.visibility || "";
  const projectId = category.key === "project" ? filters.projectId : "";

  return {
    page,
    per_page: filters.perPage,
    scope: scope || undefined,
    visibility: visibility || undefined,
    project_id: projectId || undefined
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
  }, [filters.category, filters.perPage, filters.projectId, page, revision]);

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
  const [filters, setFilters] = useState({ category: "all", projectId: "", perPage: 15 });
  const [page, setPage] = useState(1);
  const [view, setView] = useState(() => window.matchMedia?.("(max-width: 700px)").matches ? "grid" : "table");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const options = useUploadOptions(normalizedRole);
  const uploads = useUploadRows({ filters, page });

  const filteredRows = useMemo(() => uploads.rows.filter((row) => {
    const searchable = `${getUploadName(row)} ${rowName(row, language)} ${ownerName(row, language)} ${uploadLocationLabel(row, language, local)} ${uploadSharingLabel(row, local)} ${row.type || ""} ${row.mime_type || ""} ${row.category || ""}`.toLowerCase();
    return searchable.includes(query.trim().toLowerCase());
  }), [language, local, query, uploads.rows]);

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
    setFilters({ category: "all", projectId: "", perPage: 15 });
  }

  function selectCategory(category) {
    setQuery("");
    setPage(1);
    setFilters((current) => sanitizeListFilters({ ...current, category, projectId: "" }));
  }

  function handleSaved(row) {
    if (row) uploads.setRows((current) => [row, ...current]);
    setCreateOpen(false);
    setToast(local.saved);
    window.setTimeout(() => setToast(""), 3500);
    if (!isDemoMode()) uploads.reload();
  }

  function handleUploadUpdated(row) {
    if (!row || !getUploadId(row)) return;
    uploads.setRows((current) => current.map((item) => String(getUploadId(item)) === String(getUploadId(row)) ? { ...item, ...row } : item));
  }

  function handleUploadDeleted(row) {
    const deletedId = getUploadId(row);
    setSelected(null);
    setToast(local.deleteSuccess);
    window.setTimeout(() => setToast(""), 3500);
    if (deletedId) {
      uploads.setRows((current) => current.filter((item) => String(getUploadId(item)) !== String(deletedId)));
    }
    if (!isDemoMode()) {
      if (uploads.rows.length <= 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        uploads.reload();
      }
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

      <section className="uploads-browser" aria-label={textFor(language, meta.title)}>
        <div className="uploads-category-tabs" role="tablist" aria-label={local.scope}>
          {fileCategoryTabs.map((tab) => (
            <button
              aria-selected={filters.category === tab.key}
              className={filters.category === tab.key ? "is-active" : ""}
              key={tab.key}
              onClick={() => selectCategory(tab.key)}
              role="tab"
              type="button"
            >
              {local[tab.copyKey]}
            </button>
          ))}
        </div>

        <div className={`uploads-filter-row ${filters.category === "project" ? "has-project-filter" : ""}`.trim()}>
          <label className="t2-resource-search uploads-search">
            <FiSearch aria-hidden="true" />
            <span className="t2-sr-only">{local.localSearch}</span>
            <input placeholder={local.localSearch} type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          {filters.category === "project" ? (
            <SelectControl label={local.projectId} value={filters.projectId} onChange={(event) => updateFilter("projectId", event.target.value)}>
              <option value="">{local.allProjects}</option>
              {options.projects.map((project) => <option key={project.id} value={project.id}>{rowName(project, language)}</option>)}
            </SelectControl>
          ) : null}
          <span className="t2-resource-count">{totalLabel} {local.records}</span>
          <div className="t2-view-toggle" role="group" aria-label={copy.view}>
            <IconButton className={view === "table" ? "is-active" : ""} label={copy.tableView} onClick={() => setView("table")}><FiList /></IconButton>
            <IconButton className={view === "grid" ? "is-active" : ""} label={copy.gridView} onClick={() => setView("grid")}><FiGrid /></IconButton>
          </div>
        </div>
      </section>

      {uploads.status === "loading" ? <Panel><SkeletonTable rows={6} /></Panel> : null}
      {uploads.status === "error" ? <Panel><ErrorState onRetry={uploads.reload} retryLabel={copy.retry} title={uploads.error || copy.failedLoad} /></Panel> : null}
      {uploads.status === "ready" && !filteredRows.length ? (
        <Panel><EmptyState title={copy.noData} action={query || hasActiveFilters(filters) ? <Button icon={FiRefreshCw} onClick={resetFilters} tone="secondary">{local.clearFilters}</Button> : actionLabel ? <AddButton onClick={() => setCreateOpen(true)}>{actionLabel}</AddButton> : null} /></Panel>
      ) : null}
      {uploads.status === "ready" && filteredRows.length && view === "table" ? <UploadsTable copy={copy} language={language} local={local} onSelect={setSelected} rows={filteredRows} /> : null}
      {uploads.status === "ready" && filteredRows.length && view === "grid" ? <UploadsGrid copy={copy} language={language} local={local} onSelect={setSelected} rows={filteredRows} /> : null}
      {uploads.status === "ready" && filteredRows.length ? (
        <div className="uploads-list-footer">
          <SelectControl label={local.perPage} value={filters.perPage} onChange={(event) => updateFilter("perPage", Number(event.target.value))}>
            {[15, 25, 50].map((value) => <option key={value} value={value}>{value}</option>)}
          </SelectControl>
          {pagination.lastPage > 1 ? (
            <PaginationControls
              copy={copy}
              disabled={uploads.status === "loading"}
              page={pagination.currentPage}
              totalPages={pagination.lastPage}
              onNext={() => setPage((current) => Math.min(pagination.lastPage, current + 1))}
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
            />
          ) : null}
        </div>
      ) : null}

      <Modal description={local.createDescription} onClose={() => setCreateOpen(false)} open={createOpen} title={actionLabel || local.createTitle}>
        <UploadCreateForm copy={copy} local={local} onCancel={() => setCreateOpen(false)} onSaved={handleSaved} options={options} />
      </Modal>

      <Modal onClose={() => setSelected(null)} open={Boolean(selected)} title={local.detailTitle || copy.details}>
        {selected ? (
          <UploadDetails
            copy={copy}
            language={language}
            local={local}
            onDownload={downloadUpload}
            onLoadPreview={previewUpload}
            onDeleted={handleUploadDeleted}
            onRefreshList={uploads.reload}
            onUpdated={handleUploadUpdated}
            row={selected}
            canManage={normalizedRole === "company_owner"}
            staff={options.staff}
            services={{ deleteUpload, deleteUploadPermission, getUpload, getUploadStatus, updateUploadPermissions }}
          />
        ) : null}
      </Modal>
    </div>
  );
}

function UploadsTable({ copy, language, local, onSelect, rows }) {
  const columns = [
    { key: "name", label: copy.name },
    { key: "location", label: local.location },
    { key: "sharing", label: local.sharing },
    { key: "status", label: local.processingStatus },
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
                {columns.map((column) => <td key={column.key}>{renderUploadCell(column.key, row, language, local)}</td>)}
                <td className="t2-table__actions"><IconButton label={`${copy.details}: ${rowName(row, language)}`} onClick={() => onSelect(row)}><FiMoreHorizontal /></IconButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function UploadsGrid({ copy, language, local, onSelect, rows }) {
  return (
    <div className="t2-resource-grid">
      {rows.map((row) => (
        <article className="t2-resource-card" key={uploadKey(row, language)}>
          <header><span><FiFileText aria-hidden="true" /></span><span className={`upload-status upload-status--${uploadStatusTone(row)}`}><StatusBadge value={getProcessingStatus(row) || row.status} /></span></header>
          <h2>{getUploadName(row)}</h2>
          <p>{[uploadLocationLabel(row, language, local), uploadSharingLabel(row, local), row.type || row.mime_type || row.category || formatUploadSize(row.file_size || row.size)].filter(Boolean).join(" - ")}</p>
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
  const [uploadProgress, setUploadProgress] = useState({ status: "idle", percent: 0, error: "" });

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
    setUploadProgress({ status: "uploading", percent: 0, error: "" });
    try {
      const payload = await uploadFiles({
        ...buildUploadPayload(form, files),
        onUploadProgress: (progress) => {
          setUploadProgress({ status: "uploading", percent: progress.percent ?? 0, error: "" });
        }
      });
      const data = getPayloadData(payload);
      const created = Array.isArray(data?.files) ? data.files[0] : data?.upload || data?.file || data;
      setUploadProgress({ status: "completed", percent: 100, error: "" });
      onSaved(created && typeof created === "object" ? created : null);
    } catch (requestError) {
      if (isDemoMode()) {
        setUploadProgress({ status: "completed", percent: 100, error: "" });
        onSaved({ id: `demo-${Date.now()}`, name: files[0]?.name, type: files[0]?.type || "File", size: files[0]?.size, scope: form.scope, visibility: form.visibility, status: "pending", updated_at: new Date().toISOString() });
      } else {
        setFieldErrors(mapValidationErrors(requestError?.validationErrors));
        setError(requestError?.message || copy.failedSave);
        setUploadProgress({ status: "failed", percent: 0, error: requestError?.message || copy.failedSave });
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
          <input accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" multiple onChange={(event) => { setFiles(Array.from(event.target.files || [])); setFieldErrors((current) => ({ ...current, files: "" })); setUploadProgress({ status: "idle", percent: 0, error: "" }); }} type="file" />
        </label>
      </Field>
      <UploadProgress files={files} state={uploadProgress} />
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

function sanitizeListFilters(filters) {
  const next = { ...filters, perPage: Number(filters.perPage) || 15 };
  if (!fileCategoryTabs.some((tab) => tab.key === next.category)) next.category = "all";
  if (next.category !== "project") next.projectId = "";
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
  return Boolean(filters.category !== "all" || filters.projectId || Number(filters.perPage) !== 15);
}

function visibilityLabel(value, local) {
  if (value === "private") return local.private;
  if (value === "members") return local.companyMembers;
  if (value === "selected") return local.selectedUsers;
  return value;
}

function renderUploadCell(key, row, language, local) {
  if (key === "name") return <span className="t2-table-name"><b>{getUploadName(row)}</b>{row.description ? <small>{row.description}</small> : null}</span>;
  if (key === "status") return <span className={`upload-status upload-status--${uploadStatusTone(row)}`}><StatusBadge value={getProcessingStatus(row) || row.status} /></span>;
  if (key === "updated") return formatDate(row.updated_at || row.created_at, language);
  if (key === "location") return uploadLocationLabel(row, language, local);
  if (key === "sharing") return uploadSharingLabel(row, local);
  if (key === "size") return formatUploadSize(row.file_size || row.size);
  return row[key] || "-";
}

function uploadLocationLabel(row, language, local) {
  const scope = String(row.scope || "").toLowerCase();
  if (scope === "company") return local.companyLocation;
  if (scope === "personal") return local.myFiles;
  if (scope === "project") return projectNameForUpload(row, language) || local.projectFiles;
  if (scope === "task") {
    const projectName = projectNameForUpload(row, language);
    const taskName = taskNameForUpload(row, language);
    return [projectName, taskName].filter(Boolean).join(" / ") || local.projectFiles;
  }
  return local.unknownLocation;
}

function uploadSharingLabel(row, local) {
  const visibility = String(row.visibility || "").toLowerCase();
  if (visibility === "private") return local.private;
  if (visibility === "members") return local.companyMembers;
  if (visibility === "selected") return local.selectedSharing;
  return local.unknownLocation;
}

function projectNameForUpload(row, language) {
  return row.project?.name || row.project_name || row.project?.title || (language === "ar" ? row.project?.name_ar : row.project?.name_en) || "";
}

function taskNameForUpload(row, language) {
  return row.task?.title || row.task_name || row.task?.name || (language === "ar" ? row.task?.title_ar : row.task?.title_en) || "";
}

function uploadKey(row, language) {
  return row.id || row.uuid || row.upload_id || row.file_id || getUploadName(row) || rowName(row, language);
}
