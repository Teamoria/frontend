import { useEffect, useRef, useState } from "react";
import {
  FiDownload,
  FiCheck,
  FiEye,
  FiFileText,
  FiFilter,
  FiLock,
  FiMic,
  FiMonitor,
  FiRefreshCw,
  FiShare2,
  FiTrash2,
  FiUploadCloud,
  FiVideo,
  FiX
} from "react-icons/fi";
import {
  deleteUpload,
  deleteUploadPermission,
  downloadUpload,
  createTask,
  getConfiguredUploadApiBaseUrl,
  getInternalCompanyId,
  getPayloadData,
  getUpload,
  listAdminProjects,
  listCompanyProjects,
  listMyUploads,
  listStaff,
  listUploads,
  listUsers,
  previewUpload,
  updateUploadPermissions,
  uploadFiles
} from "../../lib/api.js";
import { useAuth } from "../../lib/AuthContext.jsx";

const scopeOptions = [
  { value: "personal", label: "Personal" },
  { value: "company", label: "Company" },
  { value: "project", label: "Project" },
  { value: "task", label: "Task" }
];

const visibilityOptions = [
  { value: "private", label: "Private" },
  { value: "members", label: "Members" },
  { value: "selected", label: "Selected users" }
];

export default function UploadCenterWorkspace({ view = "all", filesHref = "#/owner/uploads/files", uploadHref = "#/owner/uploads" }) {
  const { isAdmin, normalizedRole, user } = useAuth();
  const showUpload = view !== "files";
  const showFiles = view !== "upload";
  const fileInputRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [shareUsers, setShareUsers] = useState([]);
  const [form, setForm] = useState({
    scope: "personal",
    visibility: "private",
    project_id: "",
    task_id: "",
    shared_with_user_ids: []
  });
  const [filters, setFilters] = useState({
    scope: "",
    visibility: "",
    project_id: "",
    task_id: "",
    per_page: 15,
    mine: false
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [permissionsModal, setPermissionsModal] = useState(null);
  const [aiResultsModal, setAiResultsModal] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);

  useEffect(() => {
    loadProjects();
    loadShareUsers();
  }, []);

  useEffect(() => {
    if (showFiles) loadUploads();
  }, [filters.scope, filters.visibility, filters.project_id, filters.task_id, filters.per_page, filters.mine, showFiles]);

  useEffect(() => {
    const uploadId = aiResultsModal?.upload?.id || aiResultsModal?.asset?.id;
    const processingStatus = aiResultsModal?.upload
      ? aiResultsModal.upload.processing_status || aiResultsModal.upload.processingStatus || aiResultsModal.upload.status
      : "";

    if (!uploadId || aiResultsModal?.isLoading || aiResultsModal?.error || isProcessingReady(processingStatus)) {
      return undefined;
    }

    const timerId = window.setTimeout(async () => {
      try {
        const payload = await getUpload(uploadId);
        const upload = getPayloadData(payload)?.upload || getPayloadData(payload);
        setAiResultsModal((current) => {
          if (!current || (current.upload?.id || current.asset?.id) !== uploadId) return current;
          return {
            ...current,
            asset: normalizeAsset(upload || current.asset),
            upload: upload || current.upload,
            error: ""
          };
        });
      } catch (error) {
        setAiResultsModal((current) => {
          if (!current || (current.upload?.id || current.asset?.id) !== uploadId) return current;
          return { ...current, error: error.message };
        });
      }
    }, 3000);

    return () => window.clearTimeout(timerId);
  }, [aiResultsModal]);

  function updateForm(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "scope" && value !== "project") next.project_id = "";
      if (field === "scope" && value !== "task") next.task_id = "";
      if (field === "visibility" && value !== "selected") next.shared_with_user_ids = [];
      return next;
    });
  }

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  async function loadProjects() {
    try {
      const payload = isAdmin ? await listAdminProjects() : await listCompanyProjects();
      setProjects(extractRows(getPayloadData(payload), ["projects"]).map(normalizeProject).filter((project) => project.id));
    } catch {
      setProjects([]);
    }
  }

  async function loadShareUsers() {
    try {
      const payload = isAdmin ? await listUsers({ page: 1 }) : await listStaff({ page: 1 });
      setShareUsers(extractRows(getPayloadData(payload), ["users", "staff"]).map(normalizeShareUser).filter((item) => item.id));
    } catch {
      setShareUsers([]);
    }
  }

  async function loadUploads() {
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const cleanFilters = cleanObject({
        scope: filters.scope,
        visibility: filters.visibility,
        project_id: filters.project_id,
        task_id: filters.task_id,
        per_page: filters.per_page
      });
      const payload = filters.mine ? await listMyUploads(cleanFilters) : await listUploads(cleanFilters);
      setAssets(extractRows(getPayloadData(payload), ["files", "uploads", "assets"]).map(normalizeAsset));
    } catch (error) {
      setAssets([]);
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  function addFiles(files) {
    const incoming = Array.from(files || []);
    if (!incoming.length) return;
    setSelectedFiles((current) => {
      const seen = new Set(current.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
      return [...current, ...incoming.filter((file) => !seen.has(`${file.name}-${file.size}-${file.lastModified}`))];
    });
  }

  function toggleSelectedUser(userId) {
    setForm((current) => ({
      ...current,
      shared_with_user_ids: current.shared_with_user_ids.includes(userId)
        ? current.shared_with_user_ids.filter((id) => id !== userId)
        : [...current.shared_with_user_ids, userId]
    }));
  }

  async function submitUpload(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!selectedFiles.length) {
      setStatus({ type: "error", message: "Select at least one file to upload." });
      return;
    }
    if (form.scope === "project" && !form.project_id) {
      setStatus({ type: "error", message: "Choose a project for project files." });
      return;
    }
    if (form.scope === "task" && !form.task_id.trim()) {
      setStatus({ type: "error", message: "Enter a task id for task files." });
      return;
    }
    if (form.visibility === "selected" && !form.shared_with_user_ids.length) {
      setStatus({ type: "error", message: "Choose at least one user for selected sharing." });
      return;
    }

    setIsUploading(true);
    try {
      const payload = await uploadFiles({
        files: selectedFiles,
        scope: form.scope,
        visibility: form.visibility,
        company_id: getInternalCompanyId() || user?.company_id || user?.company?.id,
        project_id: form.scope === "project" ? form.project_id : undefined,
        task_id: form.scope === "task" ? form.task_id : undefined,
        shared_with_user_ids: form.visibility === "selected" ? form.shared_with_user_ids : []
      });
      const uploaded = getFirstUploadFromPayload(getPayloadData(payload));
      const fallbackUpload = {
        file_name: selectedFiles[0]?.name,
        original_name: selectedFiles[0]?.name,
        processing_status: uploaded?.processing_status || "queued",
        status: uploaded?.status || "uploaded"
      };
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatus({ type: "success", message: "Files uploaded successfully." });
      setAiResultsModal({
        asset: normalizeAsset(uploaded || fallbackUpload),
        isLoading: false,
        upload: uploaded || fallbackUpload,
        error: ""
      });
      if (showFiles) await loadUploads();
    } catch (error) {
      setStatus({ type: "error", message: getUploadSubmitErrorMessage(error, form) });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload(asset) {
    if (!asset.id) {
      setStatus({ type: "error", message: "This file does not have an upload id." });
      return;
    }
    try {
      const result = await downloadUpload(asset.id);
      if (result?.blob) {
        const url = URL.createObjectURL(result.blob);
        triggerDownload(url, result.filename || asset.name);
        URL.revokeObjectURL(url);
        return;
      }
      const url = result?.data?.url || result?.url || asset.url;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function handleDelete(asset) {
    if (!asset.id) {
      setStatus({ type: "error", message: "This file does not have an upload id." });
      return;
    }
    if (!window.confirm(`Delete ${asset.name}?`)) return;

    try {
      await deleteUpload(asset.id);
      setStatus({ type: "success", message: "File deleted successfully." });
      await loadUploads();
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function handlePreview(asset) {
    if (!asset.id) {
      setStatus({ type: "error", message: "This file does not have an upload id." });
      return;
    }

    setPreviewModal({ asset, isLoading: true, url: "", blob: null, filename: asset.name, contentType: "", error: "" });
    try {
      const result = await previewUpload(asset.id);
      if (!result?.blob) {
        setPreviewModal({ asset, isLoading: false, url: "", blob: null, filename: asset.name, contentType: "", error: "Preview is not available for this file." });
        return;
      }
      const url = URL.createObjectURL(result.blob);
      setPreviewModal({
        asset,
        isLoading: false,
        url,
        blob: result.blob,
        filename: result.filename || asset.name,
        contentType: result.blob.type || asset.mime_type || asset.type || "",
        error: ""
      });
    } catch (error) {
      setPreviewModal({ asset, isLoading: false, url: "", blob: null, filename: asset.name, contentType: "", error: error.message });
    }
  }

  function closePreview() {
    if (previewModal?.url) URL.revokeObjectURL(previewModal.url);
    setPreviewModal(null);
  }

  async function handleViewAiResults(asset) {
    if (!asset.id) {
      setStatus({ type: "error", message: "This file does not have an upload id." });
      return;
    }

    setAiResultsModal({ asset, isLoading: true, upload: null, error: "" });
    try {
      const payload = await getUpload(asset.id);
      const upload = getPayloadData(payload)?.upload || getPayloadData(payload);
      setAiResultsModal({ asset, isLoading: false, upload, error: "" });
    } catch (error) {
      setAiResultsModal({ asset, isLoading: false, upload: null, error: error.message });
    }
  }

  return (
    <section className="owner-upload-page">
      <div className="owner-upload-toprow">
        {view === "upload" ? <a className="owner-upload-nav-link" href={filesHref}>View Uploaded Files</a> : null}
        {view === "files" ? <a className="owner-upload-nav-link" href={uploadHref}>Upload New File</a> : null}
        <button className="owner-upload-refresh" type="button" onClick={showFiles ? loadUploads : () => { loadProjects(); loadShareUsers(); }} disabled={showFiles ? isLoading : false}>
          <FiRefreshCw aria-hidden="true" />
          Refresh
        </button>
      </div>

      <header className="owner-upload-header">
        <h1>{view === "files" ? "Uploaded Files" : "Upload Center"}</h1>
        <p>{view === "files" ? "Review uploaded files, AI processing results, sharing, downloads, and deletion controls." : "Upload files with scope, visibility, selected-user sharing, download, delete, and permission controls."}</p>
        {view === "files" ? null : <code className="owner-upload-api-url">API: {getConfiguredUploadApiBaseUrl()}/uploads</code>}
      </header>

      {status.message ? <p className={`auth-alert auth-alert--${status.type}`} role="alert">{status.message}</p> : null}

      {showUpload ? <form className="owner-upload-dropzone owner-upload-dropzone--focused" onSubmit={submitUpload}>
        <input hidden multiple ref={fileInputRef} type="file" onChange={(event) => addFiles(event.target.files)} />
        <FiUploadCloud aria-hidden="true" />
        <h2>Upload files to backend storage</h2>
        <p>Choose scope and visibility before sending files to the authenticated uploads API.</p>

        <div className="owner-upload-controls owner-upload-controls--expanded">
          <label>
            <span>Scope</span>
            <select value={form.scope} onChange={(event) => updateForm("scope", event.target.value)}>
              {scopeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label>
            <span>Visibility</span>
            <select value={form.visibility} onChange={(event) => updateForm("visibility", event.target.value)}>
              {visibilityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          {form.scope === "project" ? (
            <label>
              <span>Project</span>
              <select value={form.project_id} onChange={(event) => updateForm("project_id", event.target.value)}>
                <option value="">Choose project</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </label>
          ) : null}
          {form.scope === "task" ? (
            <label>
              <span>Task ID</span>
              <input value={form.task_id} onChange={(event) => updateForm("task_id", event.target.value)} placeholder="Task id" />
            </label>
          ) : null}
        </div>

        {form.visibility === "selected" ? (
          <UserPicker users={shareUsers} selectedIds={form.shared_with_user_ids} onToggle={toggleSelectedUser} />
        ) : null}

        <div
          className="owner-upload-picker"
          role="button"
          tabIndex="0"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            addFiles(event.dataTransfer.files);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <strong>Browse files</strong>
          <span>or drop them here</span>
        </div>

        {selectedFiles.length ? (
          <div className="owner-upload-selected-list">
            {selectedFiles.map((file, index) => (
              <article key={`${file.name}-${file.size}-${file.lastModified}`}>
                <FileIcon category={inferCategory(file.name)} />
                <div>
                  <b>{file.name}</b>
                  <span>{formatBytes(file.size)}</span>
                </div>
                <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setSelectedFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                  <FiX aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        ) : null}

        <button type="submit" disabled={isUploading || (showFiles && isLoading)}>
          {isUploading ? "Uploading..." : "Upload Files"}
        </button>
      </form> : null}

      {showFiles ? <section className="owner-upload-assets">
        <div className="owner-upload-section-head">
          <h2>Backend Uploads</h2>
          <div className="owner-upload-actions">
            <button type="button" onClick={() => setFilters({ scope: "", visibility: "", project_id: "", task_id: "", per_page: 15, mine: false })}>
              <FiFilter aria-hidden="true" />
              Clear
            </button>
            <button type="button" onClick={loadUploads}>
              <FiRefreshCw aria-hidden="true" />
              Apply
            </button>
          </div>
        </div>

        <div className="owner-upload-filter-panel">
          <label>
            <span>Scope</span>
            <select value={filters.scope} onChange={(event) => updateFilter("scope", event.target.value)}>
              <option value="">All scopes</option>
              {scopeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label>
            <span>Visibility</span>
            <select value={filters.visibility} onChange={(event) => updateFilter("visibility", event.target.value)}>
              <option value="">All visibility</option>
              {visibilityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label>
            <span>Project</span>
            <select value={filters.project_id} onChange={(event) => updateFilter("project_id", event.target.value)}>
              <option value="">All projects</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <label>
            <span>Task ID</span>
            <input value={filters.task_id} onChange={(event) => updateFilter("task_id", event.target.value)} placeholder="Any task" />
          </label>
          <label>
            <span>Per page</span>
            <select value={filters.per_page} onChange={(event) => updateFilter("per_page", event.target.value)}>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
          <label className="owner-upload-checkbox">
            <input checked={filters.mine} type="checkbox" onChange={(event) => updateFilter("mine", event.target.checked)} />
            <span>Mine only</span>
          </label>
        </div>

        <div className="owner-upload-table-wrap">
          <div className="container--scroll-x">
            <table className="owner-upload-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Scope</th>
                  <th>Visibility</th>
                  <th>Uploaded Date</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!assets.length ? (
                  <tr><td colSpan="6">{isLoading ? "Loading uploads from API..." : "No uploaded files found."}</td></tr>
                ) : assets.map((asset) => (
                  <tr key={asset.id || asset.path || asset.name}>
                    <td><FileIcon category={asset.category} /><span>{asset.name}</span></td>
                    <td>{formatLabel(asset.scope)}</td>
                    <td>
                      <span className="owner-upload-visibility">
                        {asset.visibility === "private" ? <FiLock aria-hidden="true" /> : <FiShare2 aria-hidden="true" />}
                        {formatLabel(asset.visibility)}
                      </span>
                    </td>
                    <td>{asset.date}</td>
                    <td><div className="owner-upload-tags"><span>{asset.sourceLabel}</span></div></td>
                    <td>
                      <div className="owner-upload-row-actions">
                        <button type="button" title="Preview file" onClick={() => handlePreview(asset)}><FiEye aria-hidden="true" /></button>
                        <button type="button" title="Download file" onClick={() => handleDownload(asset)}><FiDownload aria-hidden="true" /></button>
                        <button type="button" title="View AI results" onClick={() => handleViewAiResults(asset)}><FiMonitor aria-hidden="true" /></button>
                        <button type="button" title="Manage permissions" onClick={() => setPermissionsModal(asset)}><FiShare2 aria-hidden="true" /></button>
                        <button className="owner-upload-danger" type="button" title="Delete file" onClick={() => handleDelete(asset)}><FiTrash2 aria-hidden="true" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section> : null}

      {permissionsModal ? (
        <PermissionsModal
          asset={permissionsModal}
          users={shareUsers}
          onClose={() => setPermissionsModal(null)}
          onSaved={() => {
            setPermissionsModal(null);
            setStatus({ type: "success", message: "Permissions updated successfully." });
            loadUploads();
          }}
          onError={(message) => setStatus({ type: "error", message })}
        />
      ) : null}

      {aiResultsModal ? (
        <AiResultsModal
          state={aiResultsModal}
          people={shareUsers}
          projects={projects}
          defaultProjectId={getDefaultTaskProjectId(aiResultsModal, projects)}
          role={normalizedRole}
          onClose={() => setAiResultsModal(null)}
          onStatus={(nextStatus) => setStatus(nextStatus)}
        />
      ) : null}

      {previewModal ? (
        <PreviewModal
          state={previewModal}
          onClose={closePreview}
        />
      ) : null}
    </section>
  );
}

function PreviewModal({ state, onClose }) {
  const contentType = String(state.contentType || "").toLowerCase();
  const filename = state.filename || state.asset?.name || "File preview";
  const extension = String(filename).split(".").pop()?.toLowerCase() || "";
  const isPdf = contentType.includes("pdf") || extension === "pdf";
  const isImage = contentType.startsWith("image/");
  const isVideo = contentType.startsWith("video/");
  const isAudio = contentType.startsWith("audio/");
  const isText = contentType.startsWith("text/") || ["txt", "md", "csv", "json", "log"].includes(extension);
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!state.blob || !isText) {
      setTextContent("");
      return undefined;
    }

    state.blob.text().then((value) => {
      if (!cancelled) setTextContent(value);
    });

    return () => {
      cancelled = true;
    };
  }, [state.blob, isText]);

  return (
    <div className="owner-upload-modal-layer" role="presentation">
      <button className="owner-upload-modal-backdrop" type="button" aria-label="Close preview modal" onClick={onClose} />
      <section className="owner-upload-permissions-modal owner-upload-preview-modal" role="dialog" aria-modal="true" aria-labelledby="upload-preview-title">
        <header>
          <div>
            <h2 id="upload-preview-title">File preview</h2>
            <p>{filename}</p>
          </div>
          <button type="button" aria-label="Close preview modal" onClick={onClose}><FiX aria-hidden="true" /></button>
        </header>

        {state.isLoading ? <p>Loading preview...</p> : null}
        {state.error ? <p className="auth-alert auth-alert--error">{state.error}</p> : null}

        {!state.isLoading && !state.error && state.url ? (
          <div className="owner-upload-preview-body">
            {isPdf ? <iframe title={filename} src={state.url} /> : null}
            {isImage ? <img alt={filename} src={state.url} /> : null}
            {isVideo ? <video controls src={state.url} /> : null}
            {isAudio ? <audio controls src={state.url} /> : null}
            {isText ? <pre>{textContent || "Loading text..."}</pre> : null}
            {!isPdf && !isImage && !isVideo && !isAudio && !isText ? (
              <div className="owner-upload-preview-fallback">
                <FiFileText aria-hidden="true" />
                <p>Preview is not available for this file type.</p>
                <a href={state.url} download={filename}>Download file</a>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function AiResultsModal({ defaultProjectId = "", onClose, onStatus, people, projects, role, state }) {
  const upload = state.upload || {};
  const summary = normalizeSummary(upload);
  const decisions = Array.isArray(upload.decisions) ? upload.decisions : [];
  const extractedTasks = normalizeExtractedTasks(upload, { defaultProjectId });
  const [taskDrafts, setTaskDrafts] = useState(() => extractedTasks);
  const [savingTaskId, setSavingTaskId] = useState("");
  const chunks = Array.isArray(upload.chunks) ? upload.chunks : [];
  const processingStatus = upload.processing_status || upload.processingStatus || upload.status || "queued";
  const isReady = isProcessingReady(processingStatus);
  const extractedTaskSignature = extractedTasks.map((task) => `${task.localId}:${task.title}:${task.description}:${task.project_id}`).join("|");

  useEffect(() => {
    setTaskDrafts((current) => {
      const hasUserChanges = current.some((task) => task.created || task.rejected);
      if (hasUserChanges) return current;
      return extractedTasks;
    });
  }, [upload.id, extractedTaskSignature]);

  function updateTaskDraft(id, field, value) {
    setTaskDrafts((current) => current.map((task) => task.localId === id ? { ...task, [field]: value } : task));
  }

  function rejectTaskDraft(id) {
    setTaskDrafts((current) => current.map((task) => task.localId === id ? { ...task, rejected: true } : task));
  }

  async function approveTaskDraft(task) {
    if (!task.title.trim()) {
      onStatus?.({ type: "error", message: "Task title is required before creating a task." });
      return;
    }
    if (!task.project_id) {
      onStatus?.({ type: "error", message: "Choose a project before creating a task." });
      return;
    }

    setSavingTaskId(task.localId);
    try {
      await createTask({
        project_id: task.project_id,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        status: "todo",
        assignee_ids: task.assignee_id ? [task.assignee_id] : []
      }, { role });
      setTaskDrafts((current) => current.map((item) => item.localId === task.localId ? { ...item, created: true } : item));
      onStatus?.({ type: "success", message: "Task created from uploaded file result." });
    } catch (error) {
      onStatus?.({ type: "error", message: error.message });
    } finally {
      setSavingTaskId("");
    }
  }

  return (
    <div className="owner-upload-modal-layer" role="presentation">
      <button className="owner-upload-modal-backdrop" type="button" aria-label="Close AI results modal" onClick={onClose} />
      <section className="owner-upload-permissions-modal owner-upload-ai-modal" role="dialog" aria-modal="true" aria-labelledby="upload-ai-results-title">
        <header>
          <div>
            <h2 id="upload-ai-results-title">AI results</h2>
            <p>{state.asset?.name || upload.original_name || "Uploaded file"}</p>
          </div>
          <button type="button" aria-label="Close AI results modal" onClick={onClose}><FiX aria-hidden="true" /></button>
        </header>

        {state.isLoading ? <p>Loading AI results...</p> : null}
        {state.error ? <p className="auth-alert auth-alert--error">{state.error}</p> : null}

        {!state.isLoading && !state.error ? (
          <div className="owner-upload-ai-results">
            <section>
              <h3>Processing</h3>
              <p><strong>Upload status:</strong> {formatLabel(upload.status || "uploaded")}</p>
              <p><strong>Processing status:</strong> {formatLabel(processingStatus)}</p>
              {upload.processing_error ? <p className="auth-alert auth-alert--error">{upload.processing_error}</p> : null}
              {!isReady ? <p className="owner-upload-processing-note">File is still processing. Please refresh or check again later.</p> : null}
            </section>
            <section>
              <h3>Summary</h3>
              <p dir="auto">{summary.summary || "No summary available yet."}</p>
            </section>
            <section>
              <h3>Transcript</h3>
              <pre dir="auto">{summary.transcript || upload.transcript || "No transcript available yet."}</pre>
            </section>
            <section>
              <h3>Decisions</h3>
              {decisions.length ? (
                <ul>{decisions.map((item) => <li dir="auto" key={item.id}>{item.decision_text}</li>)}</ul>
              ) : <p>No decisions extracted.</p>}
            </section>
            <section className="owner-upload-task-review">
              <h3>Extracted Tasks</h3>
              {!taskDrafts.length ? <p>No tasks extracted.</p> : null}
              {taskDrafts.map((task) => (
                <article className={`owner-upload-task-draft ${task.rejected ? "is-rejected" : ""} ${task.created ? "is-created" : ""}`} key={task.localId}>
                  <div className="owner-upload-task-draft-head">
                    <span>{task.created ? "Created" : task.rejected ? "Rejected" : "Needs review"}</span>
                    <div>
                      <button type="button" disabled={task.created || task.rejected || savingTaskId === task.localId} onClick={() => approveTaskDraft(task)}>
                        {savingTaskId === task.localId ? "Saving..." : <><FiCheck aria-hidden="true" />Create</>}
                      </button>
                      <button type="button" disabled={task.created || task.rejected} onClick={() => rejectTaskDraft(task.localId)}>
                        <FiTrash2 aria-hidden="true" />Reject
                      </button>
                    </div>
                  </div>
                  <label>
                    <span>Task title</span>
                    <input value={task.title} disabled={task.created || task.rejected} onChange={(event) => updateTaskDraft(task.localId, "title", event.target.value)} />
                  </label>
                  <label>
                    <span>Description</span>
                    <textarea value={task.description} disabled={task.created || task.rejected} onChange={(event) => updateTaskDraft(task.localId, "description", event.target.value)} />
                  </label>
                  <div className="owner-upload-task-grid">
                    <label>
                      <span>Project</span>
                      <select value={task.project_id} disabled={task.created || task.rejected} onChange={(event) => updateTaskDraft(task.localId, "project_id", event.target.value)}>
                        <option value="">Choose project</option>
                        {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Assignee</span>
                      <select value={task.assignee_id} disabled={task.created || task.rejected} onChange={(event) => updateTaskDraft(task.localId, "assignee_id", event.target.value)}>
                        <option value="">Unassigned</option>
                        {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Deadline</span>
                      <input type="date" value={task.due_date} disabled={task.created || task.rejected} onChange={(event) => updateTaskDraft(task.localId, "due_date", event.target.value)} />
                    </label>
                    <label>
                      <span>Priority</span>
                      <select value={task.priority} disabled={task.created || task.rejected} onChange={(event) => updateTaskDraft(task.localId, "priority", event.target.value)}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </label>
                  </div>
                </article>
              ))}
            </section>
            <section>
              <h3>Knowledge chunks</h3>
              {chunks.length ? (
                <ul>{chunks.map((item) => <li dir="auto" key={item.id}>{item.content}</li>)}</ul>
              ) : <p>No chunks available.</p>}
            </section>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function UserPicker({ users, selectedIds, onToggle }) {
  return (
    <fieldset className="owner-upload-user-picker">
      <legend>Shared with</legend>
      {!users.length ? <p>No users available for selected sharing.</p> : users.map((user) => (
        <label key={user.id}>
          <input checked={selectedIds.includes(user.id)} type="checkbox" onChange={() => onToggle(user.id)} />
          <span>{user.initials}</span>
          <b>{user.name}</b>
          <small>{user.email}</small>
        </label>
      ))}
    </fieldset>
  );
}

function PermissionsModal({ asset, users, onClose, onError, onSaved }) {
  const currentIds = getSharedUserIds(asset);
  const [selectedIds, setSelectedIds] = useState(currentIds);
  const [accessLevel, setAccessLevel] = useState("view");
  const [isSaving, setIsSaving] = useState(false);

  async function savePermissions(event) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await updateUploadPermissions(asset.id, {
        user_ids: selectedIds,
        shared_with_user_ids: selectedIds,
        access_level: accessLevel
      });
      const removedIds = currentIds.filter((id) => !selectedIds.includes(id));
      await Promise.all(removedIds.map((userId) => deleteUploadPermission(asset.id, userId)));
      onSaved();
    } catch (error) {
      onError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="owner-upload-modal-layer" role="presentation">
      <button className="owner-upload-modal-backdrop" type="button" aria-label="Close permissions modal" onClick={onClose} />
      <form className="owner-upload-permissions-modal" role="dialog" aria-modal="true" aria-labelledby="upload-permissions-title" onSubmit={savePermissions}>
        <header>
          <div>
            <h2 id="upload-permissions-title">File permissions</h2>
            <p>{asset.name}</p>
          </div>
          <button type="button" aria-label="Close permissions modal" onClick={onClose}><FiX aria-hidden="true" /></button>
        </header>
        <label className="owner-upload-access-level">
          <span>Access level</span>
          <select value={accessLevel} onChange={(event) => setAccessLevel(event.target.value)}>
            <option value="view">View</option>
            <option value="manage">Manage</option>
          </select>
        </label>
        <UserPicker
          users={users}
          selectedIds={selectedIds}
          onToggle={(userId) => setSelectedIds((current) => current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId])}
        />
        <footer>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save permissions"}</button>
        </footer>
      </form>
    </div>
  );
}

function FileIcon({ category }) {
  const Icon = category === "video" ? FiVideo : category === "audio" ? FiMic : FiFileText;
  return <Icon aria-hidden="true" />;
}

function extractRows(data, keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function normalizeProject(project) {
  return { id: String(project.id || project.uuid || ""), name: project.name || project.title || "Untitled project" };
}

function normalizeShareUser(user) {
  const value = user.user || user;
  const name = value.name || value.full_name || value.email || "User";
  return {
    id: String(value.id || value.user_id || ""),
    name,
    email: value.email || "",
    initials: getInitials(name)
  };
}

function normalizeAsset(asset) {
  const name = asset.name || asset.original_name || asset.file_name || getNameFromPath(asset.path || asset.url) || "Uploaded file";
  const category = String(asset.category || inferCategory(name)).toLowerCase();
  const scope = String(asset.scope || "personal").toLowerCase();
  const visibility = String(asset.visibility || "private").toLowerCase();
  const projectName = asset.project?.name || asset.project_name || "";
  const sourceLabel = projectName || asset.task_id || scope;

  return {
    ...asset,
    id: asset.id || asset.upload_id || asset.uuid,
    name,
    category,
    scope,
    visibility,
    project_name: projectName,
    sourceLabel: formatLabel(sourceLabel),
    type: asset.type || asset.mime_type || formatLabel(category),
    date: formatDate(asset.created_at || asset.uploaded_at || asset.date),
    url: asset.url || asset.public_url || asset.path || ""
  };
}

function getFirstUploadFromPayload(data) {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] || null;
  if (Array.isArray(data.uploads)) return data.uploads[0] || null;
  if (Array.isArray(data.files)) return data.files[0] || null;
  if (Array.isArray(data.data?.uploads)) return data.data.uploads[0] || null;
  if (Array.isArray(data.data?.files)) return data.data.files[0] || null;
  return data.upload || data.file || data.data || data;
}

function normalizeSummary(upload) {
  const rawSummary = upload.summary || upload.ai_summary || upload.result?.summary || "";
  if (typeof rawSummary === "string") {
    return {
      summary: rawSummary,
      transcript: upload.transcript || upload.result?.transcript || ""
    };
  }

  return {
    summary: rawSummary?.summary || rawSummary?.text || upload.summary_text || "",
    transcript: rawSummary?.transcript || upload.transcript || upload.result?.transcript || ""
  };
}

function normalizeExtractedTasks(upload, { defaultProjectId = "" } = {}) {
  const candidates = [
    upload.tasks,
    upload.action_items,
    upload.actionItems,
    upload.summary?.tasks,
    upload.summary?.action_items,
    upload.result?.tasks,
    upload.result?.action_items
  ].find((collection) => Array.isArray(collection)) || [];

  return candidates.map((item, index) => {
    const title = item.title || item.task_title || item.task_text || item.text || item.action || `Task ${index + 1}`;
    return {
      localId: String(item.id || item.uuid || `task-${index}`),
      title,
      description: item.description || item.details || item.notes || item.task_description || "",
      due_date: normalizeDateInput(item.due_date || item.deadline || item.date),
      priority: normalizePriority(item.priority),
      project_id: String(item.project_id || item.project?.id || defaultProjectId || ""),
      assignee_id: String(item.assignee_id || item.user_id || item.owner_id || ""),
      created: false,
      rejected: false
    };
  });
}

function getDefaultTaskProjectId(modalState, projects) {
  const upload = modalState?.upload || {};
  const asset = modalState?.asset || {};
  return String(
    upload.project_id ||
    upload.project?.id ||
    asset.project_id ||
    asset.project?.id ||
    projects[0]?.id ||
    ""
  );
}

function normalizeDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function normalizePriority(value) {
  const priority = String(value || "medium").toLowerCase();
  if (["low", "medium", "high", "emergency"].includes(priority)) return priority;
  if (priority === "urgent" || priority === "critical") return "emergency";
  return "medium";
}

function getSharedUserIds(asset) {
  return [asset.shared_with_user_ids, asset.shared_users, asset.users, asset.permissions]
    .flatMap((collection) => Array.isArray(collection) ? collection : [])
    .map((item) => String(item.user_id || item.id || item.user?.id || item))
    .filter(Boolean);
}

function inferCategory(name) {
  const extension = String(name).split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extension)) return "image";
  if (["mp3", "wav", "m4a", "aac", "ogg"].includes(extension)) return "audio";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension)) return "video";
  return "document";
}

function getNameFromPath(path) {
  return String(path || "").split(/[\\/]/).pop();
}

function getInitials(value) {
  return String(value || "User")
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function cleanObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ""));
}

function isProcessingReady(statusValue) {
  return ["processed", "completed", "done", "success", "failed", "skipped"].includes(String(statusValue || "").toLowerCase());
}

function getUploadSubmitErrorMessage(error, form) {
  const message = error?.message || "Upload failed. Please try again.";
  const status = Number(error?.status || 0);

  if (form.scope === "project" && status >= 500) {
    return `Upload failed because the selected project could not be saved by the AI service. Check that project_id exists in the AI database: ${form.project_id}`;
  }

  if (form.scope === "task" && status >= 500) {
    return `Upload failed because the selected task could not be saved by the AI service. Check that task_id exists in the AI database: ${form.task_id}`;
  }

  return message;
}

function triggerDownload(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function formatLabel(value) {
  return String(value || "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB"];
  let size = value / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}
