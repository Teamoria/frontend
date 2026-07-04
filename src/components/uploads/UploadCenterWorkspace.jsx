import { useEffect, useMemo, useRef, useState } from "react";
import { FiDownload, FiFileText, FiFilter, FiMic, FiRefreshCw, FiSearch, FiUploadCloud, FiVideo, FiX } from "react-icons/fi";
import { getPayloadData, listAdminProjects, listCompanyProjects, listProjectUploads, listUploads, uploadFiles } from "../../lib/api.js";
import { useAuth } from "../../lib/AuthContext.jsx";

const categories = [
  { value: "document", label: "Document" },
  { value: "image", label: "Image" },
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" }
];

export default function UploadCenterWorkspace() {
  const { isAdmin } = useAuth();
  const fileInputRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [category, setCategory] = useState("document");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [assets, setAssets] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadUploads(selectedProjectId);
  }, [selectedProjectId]);

  const filteredAssets = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return assets;
    return assets.filter((asset) => `${asset.name} ${asset.type} ${asset.category}`.toLowerCase().includes(cleanQuery));
  }, [assets, query]);

  async function loadProjects() {
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = isAdmin ? await listAdminProjects() : await listCompanyProjects();
      const rows = extractRows(getPayloadData(payload), ["projects"]);
      const normalizedProjects = rows.map(normalizeProject).filter((project) => project.id);
      setProjects(normalizedProjects);
      setSelectedProjectId((current) => current || normalizedProjects[0]?.id || "");
    } catch (error) {
      setProjects([]);
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadUploads(projectId = selectedProjectId) {
    try {
      const payload = projectId ? await listProjectUploads(projectId) : await listUploads();
      const rows = extractRows(getPayloadData(payload), ["files", "uploads", "assets"]);
      setAssets(rows.map(normalizeAsset));
    } catch (error) {
      setAssets([]);
      if (projectId) setStatus({ type: "error", message: error.message });
    }
  }

  function addFiles(files) {
    const incoming = Array.from(files || []);
    if (incoming.length === 0) return;

    setSelectedFiles((current) => {
      const seen = new Set(current.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
      const next = incoming.filter((file) => !seen.has(`${file.name}-${file.size}-${file.lastModified}`));
      return [...current, ...next];
    });
  }

  async function submitUpload(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!selectedProjectId) {
      setStatus({ type: "error", message: "Choose a project before uploading files." });
      return;
    }

    if (selectedFiles.length === 0) {
      setStatus({ type: "error", message: "Select at least one file to upload." });
      return;
    }

    setIsUploading(true);

    try {
      await uploadFiles({ files: selectedFiles, project_id: selectedProjectId, category });
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatus({ type: "success", message: "Files uploaded successfully." });
      await loadUploads(selectedProjectId);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="owner-upload-page">
      <div className="owner-upload-toprow">
        <label className="owner-upload-search">
          <FiSearch aria-hidden="true" />
          <input placeholder="Search uploaded assets..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <button className="owner-upload-refresh" type="button" onClick={() => loadUploads(selectedProjectId)}>
          <FiRefreshCw aria-hidden="true" />
          Refresh
        </button>
      </div>

      <header className="owner-upload-header">
        <h1>Upload Center</h1>
        <p>Upload project documents, images, audio, and video directly into the authenticated workspace.</p>
      </header>

      {status.message ? <p className={`auth-alert auth-alert--${status.type}`} role="alert">{status.message}</p> : null}

      <form className="owner-upload-dropzone" onSubmit={submitUpload}>
        <input hidden multiple ref={fileInputRef} type="file" onChange={(event) => addFiles(event.target.files)} />
        <FiUploadCloud aria-hidden="true" />
        <h2>Drag and drop files to upload</h2>
        <p>Choose the project and category, then send one or more files to the uploads API.</p>

        <div className="owner-upload-controls">
          <label>
            <span>Project</span>
            <select disabled={isLoading || projects.length === 0} value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
              {projects.length === 0 ? <option value="">No projects available</option> : null}
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <label>
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        </div>

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

        {selectedFiles.length > 0 ? (
          <div className="owner-upload-selected-list">
            {selectedFiles.map((file, index) => (
              <article key={`${file.name}-${file.size}-${file.lastModified}`}>
                <FileIcon category={category} />
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

        <button type="submit" disabled={isUploading || isLoading || projects.length === 0}>
          {isUploading ? "Uploading..." : "Upload Files"}
        </button>
      </form>

      <section className="owner-upload-assets">
        <div className="owner-upload-section-head">
          <h2>Recent Knowledge Assets</h2>
          <div className="owner-upload-actions">
            <button type="button"><FiFilter aria-hidden="true" />Filter</button>
            <button type="button"><FiDownload aria-hidden="true" />Export</button>
          </div>
        </div>
        <div className="owner-upload-table-wrap">
          <div className="container--scroll-x">
            <table className="owner-upload-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Uploaded Date</th>
                  <th>Source</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length === 0 ? (
                  <tr><td colSpan="5">{isLoading ? "Loading uploads from API..." : "No uploaded files found for this project."}</td></tr>
                ) : filteredAssets.map((asset) => (
                  <tr key={asset.id || asset.path || asset.name}>
                    <td><FileIcon category={asset.category} /><span>{asset.name}</span></td>
                    <td>{asset.type}</td>
                    <td>{asset.date}</td>
                    <td><div className="owner-upload-tags"><span>{asset.categoryLabel}</span></div></td>
                    <td>{asset.url ? <a href={asset.url} target="_blank" rel="noreferrer">Open</a> : <button type="button">Indexed</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </section>
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

function normalizeAsset(asset) {
  const name = asset.name || asset.original_name || asset.file_name || getNameFromPath(asset.path || asset.url) || "Uploaded file";
  const category = String(asset.category || inferCategory(name)).toLowerCase();
  return {
    ...asset,
    name,
    category,
    categoryLabel: formatLabel(category),
    type: asset.type || asset.mime_type || formatLabel(category),
    date: formatDate(asset.created_at || asset.uploaded_at || asset.date),
    url: asset.url || asset.public_url || asset.path || ""
  };
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
