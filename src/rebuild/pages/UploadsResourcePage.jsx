import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiFileText,
  FiGrid,
  FiList,
  FiMoreHorizontal,
  FiRefreshCw,
  FiSearch,
  FiUploadCloud
} from "react-icons/fi";
import { extractRows, getPayloadData, listUploads, uploadFiles } from "../../lib/api.js";
import { isDemoMode } from "../../lib/demoMode.js";
import { usePreferences } from "../../lib/PreferencesContext.jsx";
import {
  appCopy,
  demoRows,
  formatDate,
  ownerName,
  routeMeta,
  rowName,
  statusKey,
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

const uploadPageCopy = {
  ar: {
    records: "Ø³Ø¬Ù„",
    clearFilters: "Ù…Ø³Ø­ Ø§Ù„ØªØµÙÙŠØ©",
    createTitle: "Ø¥Ø¶Ø§ÙØ© Ù…Ù„Ù",
    createDescription: "Ø§Ø±ÙØ¹ Ù…Ù„ÙÙ‹Ø§ Ø¥Ù„Ù‰ Ù…Ø¹Ø±ÙØ© Ø§Ù„Ø´Ø±ÙƒØ©.",
    fileDrop: "Ø§Ø®ØªØ± Ù…Ù„ÙÙ‹Ø§ Ù…Ù† Ø¬Ù‡Ø§Ø²Ùƒ",
    fileDropHint: "PDF Ø£Ùˆ DOCX Ø£Ùˆ XLSX Ø¨Ø­Ø¯ Ø£Ù‚ØµÙ‰ ÙŠØ­Ø¯Ø¯Ù‡ Ø§Ù„Ø®Ø§Ø¯Ù….",
    saved: "ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ù„Ù Ø¥Ù„Ù‰ Ù…Ø³Ø§Ø­Ø© Ø§Ù„Ø¹Ù…Ù„.",
    detailTitle: "ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù„Ù"
  },
  en: {
    records: "records",
    clearFilters: "Clear filters",
    createTitle: "Upload a file",
    createDescription: "Add a file to company knowledge.",
    fileDrop: "Choose a file from your device",
    fileDropHint: "PDF, DOCX, or XLSX within the server file limit.",
    saved: "The file was added to the workspace.",
    detailTitle: "File details"
  }
};

function useUploadRows() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    if (isDemoMode()) {
      setRows(demoRows.uploads);
      setStatus("ready");
      setError("");
      return () => { active = false; };
    }

    setStatus("loading");
    setError("");
    listUploads()
      .then((payload) => {
        if (!active) return;
        const data = getPayloadData(payload);
        setRows(extractRows(data, uploadDataKeys));
        setStatus("ready");
      })
      .catch((requestError) => {
        if (!active) return;
        setRows([]);
        setError(requestError?.message || "load_failed");
        setStatus("error");
      });

    return () => { active = false; };
  }, [revision]);

  return {
    rows,
    setRows,
    status,
    error,
    reload: () => setRevision((value) => value + 1)
  };
}

export default function UploadsResourcePage({ path }) {
  const { language } = usePreferences();
  const copy = appCopy[language] || appCopy.en;
  const local = uploadPageCopy[language] || uploadPageCopy.en;
  const meta = routeMeta[path] || routeMeta["/uploads"];
  const pageRows = useUploadRows();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState(() => window.matchMedia?.("(max-width: 700px)").matches ? "grid" : "table");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");

  const filteredRows = useMemo(() => pageRows.rows.filter((row) => {
    const searchable = `${rowName(row, language)} ${ownerName(row, language)} ${row.type || ""} ${row.mime_type || ""} ${row.category || ""}`.toLowerCase();
    const matchesQuery = searchable.includes(query.trim().toLowerCase());
    const matchesFilter = filter === "all" || statusKey(row.status) === filter;
    return matchesQuery && matchesFilter;
  }), [filter, language, pageRows.rows, query]);

  const actionLabel = meta.action ? copy[meta.action] : "";

  function handleSaved(row) {
    if (row) pageRows.setRows((current) => [row, ...current]);
    setCreateOpen(false);
    setToast(local.saved);
    window.setTimeout(() => setToast(""), 3500);
    if (!isDemoMode()) pageRows.reload();
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
          <option value="active">{copy.active}</option>
          <option value="pending">{copy.pending}</option>
          <option value="completed">{copy.completed}</option>
          <option value="blocked">{copy.blocked}</option>
        </SelectControl>
        <span className="t2-resource-count">{filteredRows.length} {local.records}</span>
        <div className="t2-view-toggle" role="group" aria-label={copy.view}>
          <IconButton className={view === "table" ? "is-active" : ""} label={copy.tableView} onClick={() => setView("table")}><FiList /></IconButton>
          <IconButton className={view === "grid" ? "is-active" : ""} label={copy.gridView} onClick={() => setView("grid")}><FiGrid /></IconButton>
        </div>
      </div>

      {pageRows.status === "loading" ? <Panel><SkeletonTable rows={6} /></Panel> : null}
      {pageRows.status === "error" ? <Panel><ErrorState onRetry={pageRows.reload} retryLabel={copy.retry} title={copy.failedLoad} /></Panel> : null}
      {pageRows.status === "ready" && !filteredRows.length ? (
        <Panel><EmptyState title={copy.noData} action={query || filter !== "all" ? <Button icon={FiRefreshCw} onClick={() => { setQuery(""); setFilter("all"); }} tone="secondary">{local.clearFilters}</Button> : actionLabel ? <AddButton onClick={() => setCreateOpen(true)}>{actionLabel}</AddButton> : null} /></Panel>
      ) : null}
      {pageRows.status === "ready" && filteredRows.length && view === "table" ? <UploadsTable copy={copy} language={language} onSelect={setSelected} rows={filteredRows} /> : null}
      {pageRows.status === "ready" && filteredRows.length && view === "grid" ? <UploadsGrid copy={copy} language={language} onSelect={setSelected} rows={filteredRows} /> : null}

      <Modal description={local.createDescription} onClose={() => setCreateOpen(false)} open={createOpen} title={actionLabel || local.createTitle}>
        <UploadCreateForm copy={copy} local={local} onCancel={() => setCreateOpen(false)} onSaved={handleSaved} />
      </Modal>

      <Modal onClose={() => setSelected(null)} open={Boolean(selected)} title={local.detailTitle}>
        {selected ? <UploadDetails copy={copy} language={language} row={selected} /> : null}
      </Modal>
    </div>
  );
}

function UploadsTable({ copy, language, onSelect, rows }) {
  const columns = [
    { key: "name", label: copy.name },
    { key: "type", label: copy.type },
    { key: "size", label: copy.size },
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
          <header><span><FiFileText aria-hidden="true" /></span><StatusBadge value={row.status} /></header>
          <h2>{rowName(row, language)}</h2>
          <p>{row.type || row.mime_type || row.category || row.size || row.file_size || ownerName(row, language)}</p>
          <footer><small>{formatDate(row.updated_at || row.created_at, language)}</small><Button onClick={() => onSelect(row)} tone="ghost">{copy.details}</Button></footer>
        </article>
      ))}
    </div>
  );
}

function UploadCreateForm({ copy, local, onCancel, onSaved }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!file) {
      setError(local.fileDrop);
      return;
    }

    setLoading(true);
    try {
      const payload = await uploadFiles({ files: [file], scope: "company", visibility: "company" });
      const data = getPayloadData(payload);
      const created = data?.upload || data?.file || data;
      onSaved(created && typeof created === "object" ? created : null);
    } catch (requestError) {
      if (isDemoMode()) {
        onSaved({ id: `demo-${Date.now()}`, name: file.name, type: file.type || "File", size: file.size, status: "pending", updated_at: new Date().toISOString() });
      } else {
        setError(requestError?.message || copy.failedSave);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="t2-create-form" onSubmit={submit}>
      {error ? <p className="t2-form-alert is-error" role="alert">{error}</p> : null}
      <Field hint={local.fileDropHint} label={local.fileDrop} required>
        <label className="t2-file-input"><FiUploadCloud aria-hidden="true" /><span>{file?.name || local.fileDrop}</span><input accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={(event) => setFile(event.target.files?.[0] || null)} type="file" /></label>
      </Field>
      <div className="t2-modal-actions"><Button onClick={onCancel} tone="secondary">{copy.cancel}</Button><Button loading={loading} loadingLabel={copy.loading} type="submit">{copy.create}</Button></div>
    </form>
  );
}

function UploadDetails({ copy, language, row }) {
  return (
    <div className="t2-resource-details">
      <span className="t2-resource-details__icon"><FiFileText aria-hidden="true" /></span>
      <div><small>{copy.name}</small><h3>{rowName(row, language)}</h3></div>
      <dl>
        <div><dt>{copy.status}</dt><dd><StatusBadge value={row.status} /></dd></div>
        <div><dt>{copy.type}</dt><dd>{row.type || row.mime_type || row.category || "-"}</dd></div>
        <div><dt>{copy.size}</dt><dd>{row.size || row.file_size || "-"}</dd></div>
        <div><dt>{copy.updated}</dt><dd>{formatDate(row.updated_at || row.created_at, language)}</dd></div>
      </dl>
      {row.description ? <p>{row.description}</p> : null}
    </div>
  );
}

function renderUploadCell(key, row, language) {
  if (key === "name") return <span className="t2-table-name"><b>{rowName(row, language)}</b>{row.description ? <small>{row.description}</small> : null}</span>;
  if (key === "status") return <StatusBadge value={row.status} />;
  if (key === "updated") return formatDate(row.updated_at || row.created_at, language);
  if (key === "type") return row.type || row.mime_type || row.category || "-";
  if (key === "size") return row.size || row.file_size || "-";
  return row[key] || "-";
}

function uploadKey(row, language) {
  return row.id || row.uuid || row.upload_id || row.file_id || rowName(row, language);
}
