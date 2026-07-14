import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiFileText, FiRefreshCw } from "react-icons/fi";
import { isDemoMode } from "../../../lib/demoMode.js";
import { Button, ErrorState, LoadingState, StatusBadge } from "../../ui.jsx";
import UploadAiResults from "./UploadAiResults.jsx";
import UploadDeleteAction from "./UploadDeleteAction.jsx";
import UploadPermissions from "./UploadPermissions.jsx";
import UploadPreview from "./UploadPreview.jsx";
import {
  formatUploadSize,
  getDownloadFilename,
  getProcessingStatus,
  getUploadId,
  getUploadName,
  isFailedUpload,
  safeValue,
  shouldPollUpload,
  uploadStatusTone
} from "./uploadStatus.js";

function unwrapUpload(payload) {
  const data = payload?.data ?? payload;
  return data?.upload || data?.file || data;
}

function unwrapStatus(payload) {
  const data = payload?.data ?? payload;
  return data?.upload || data?.file || data;
}

function mergeUploadStatus(upload, statusPayload) {
  const status = unwrapStatus(statusPayload);
  return {
    ...upload,
    ...status,
    processing_status: status?.processing_status ?? upload?.processing_status,
    processing_error: status?.processing_error ?? upload?.processing_error
  };
}

function projectName(upload) {
  return upload?.project?.name || upload?.project_name || upload?.project?.title || upload?.project_id || "-";
}

function taskName(upload) {
  return upload?.task?.title || upload?.task_name || upload?.task?.name || upload?.task_id || "-";
}

export default function UploadDetails({
  canManage = false,
  copy,
  language,
  local,
  onDeleted,
  onDownload,
  onLoadPreview,
  onRefreshList,
  onUpdated,
  row,
  staff = [],
  services
}) {
  const uploadId = getUploadId(row);
  const [upload, setUpload] = useState(row);
  const [state, setState] = useState({ status: "loading", error: "" });
  const [statusError, setStatusError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const status = getProcessingStatus(upload);
  const shouldPoll = shouldPollUpload(upload);
  const fields = useMemo(() => [
    [copy.name, getUploadName(upload)],
    [copy.type, safeValue(upload?.mime_type || upload?.type || upload?.content_type)],
    [copy.size, formatUploadSize(upload?.file_size || upload?.size)],
    [local.scope, safeValue(upload?.scope)],
    [local.visibility, safeValue(upload?.visibility)],
    [local.projectId, projectName(upload)],
    [local.taskId, taskName(upload)],
    [local.accessLevel, safeValue(upload?.access_level || upload?.permission?.access_level)],
    [local.processingStatus, safeValue(status)],
    [local.createdAt, upload?.created_at ? new Date(upload.created_at).toLocaleString(language === "ar" ? "ar" : "en") : "-"],
    [copy.updated, upload?.updated_at ? new Date(upload.updated_at).toLocaleString(language === "ar" ? "ar" : "en") : "-"]
  ], [copy.name, copy.size, copy.type, copy.updated, language, local.accessLevel, local.createdAt, local.processingStatus, local.projectId, local.scope, local.taskId, local.visibility, status, upload]);

  async function loadDetails() {
    if (!uploadId) {
      setState({ status: "error", error: copy.failedLoad });
      return;
    }
    setState({ status: "loading", error: "" });
    setStatusError("");
    try {
      const payload = await services.getUpload(uploadId);
      const nextUpload = unwrapUpload(payload);
      setUpload(nextUpload);
      onUpdated?.(nextUpload);
      setState({ status: "ready", error: "" });
    } catch (error) {
      setState({ status: "error", error: error?.message || copy.failedLoad });
    }
  }

  async function refreshStatus() {
    if (!uploadId) return;
    setStatusError("");
    try {
      const payload = await services.getUploadStatus(uploadId);
      setUpload((current) => {
        const nextUpload = mergeUploadStatus(current, payload);
        onUpdated?.(nextUpload);
        return nextUpload;
      });
    } catch (error) {
      setStatusError(error?.message || copy.failedLoad);
    }
  }

  async function download() {
    if (!uploadId || downloading) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const result = await onDownload(uploadId);
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = getDownloadFilename(result, upload);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(error?.message || copy.failedLoad);
    } finally {
      setDownloading(false);
    }
  }

  async function savePermissions(body) {
    if (!uploadId) return;
    if (!isDemoMode()) {
      await services.updateUploadPermissions(uploadId, body);
      await loadDetails();
    } else {
      const nextUsers = staff.filter((user) => body.user_ids?.includes(String(user.id))).map((user) => ({ ...user, access_level: body.access_level }));
      const nextUpload = { ...upload, shared_with: nextUsers };
      setUpload(nextUpload);
      onUpdated?.(nextUpload);
    }
  }

  async function removePermission(userId) {
    if (!uploadId || !userId) return;
    if (!isDemoMode()) {
      await services.deleteUploadPermission(uploadId, userId);
      await loadDetails();
    } else {
      const nextUpload = {
        ...upload,
        shared_with: (upload?.shared_with || []).filter((user) => String(user.id || user.user_id) !== String(userId))
      };
      setUpload(nextUpload);
      onUpdated?.(nextUpload);
    }
  }

  async function deleteCurrentUpload() {
    if (!uploadId) return;
    if (!isDemoMode()) {
      await services.deleteUpload(uploadId);
    }
    onDeleted?.(upload);
  }

  useEffect(() => {
    setUpload(row);
    loadDetails();
    return undefined;
  }, [uploadId]);

  useEffect(() => {
    if (!shouldPoll || state.status !== "ready") return undefined;
    const interval = window.setInterval(refreshStatus, 5000);
    return () => window.clearInterval(interval);
  }, [shouldPoll, state.status, uploadId]);

  if (state.status === "loading") return <LoadingState label={copy.loading} />;
  if (state.status === "error") return <ErrorState onRetry={loadDetails} retryLabel={copy.retry} title={state.error || copy.failedLoad} />;

  return (
    <div className="upload-details">
      <div className="t2-resource-details">
        <span className="t2-resource-details__icon"><FiFileText aria-hidden="true" /></span>
        <div><small>{copy.name}</small><h3>{getUploadName(upload)}</h3></div>
        <dl>
          <div><dt>{copy.status}</dt><dd><span className={`upload-status upload-status--${uploadStatusTone(upload)}`}><StatusBadge value={status || upload?.status} /></span></dd></div>
          {fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{safeValue(value)}</dd></div>)}
        </dl>
        {isFailedUpload(upload) && upload?.processing_error ? <p className="t2-form-alert is-error" role="alert">{upload.processing_error}</p> : null}
        <div className="t2-resource-details__actions">
          <Button icon={FiRefreshCw} onClick={() => { loadDetails(); onRefreshList?.(); }} tone="secondary">{copy.retry}</Button>
          <Button icon={FiRefreshCw} onClick={refreshStatus} tone="secondary">{local.refreshStatus}</Button>
          <Button icon={FiDownload} loading={downloading} loadingLabel={copy.loading} onClick={download}>{local.download}</Button>
        </div>
        {statusError ? <p className="t2-form-alert is-error" role="alert">{statusError}</p> : null}
        {downloadError ? <p className="t2-form-alert is-error" role="alert">{downloadError}</p> : null}
      </div>

      <UploadPreview copy={copy} local={local} onLoadPreview={onLoadPreview} upload={upload} />

      <UploadAiResults local={local} upload={upload} />

      {canManage ? (
        <>
          <UploadPermissions
            copy={copy}
            language={language}
            local={local}
            onRefresh={loadDetails}
            onRemovePermission={removePermission}
            onSavePermissions={savePermissions}
            staff={staff}
            upload={upload}
          />
          <UploadDeleteAction copy={copy} local={local} onDelete={deleteCurrentUpload} uploadName={getUploadName(upload)} />
        </>
      ) : null}
    </div>
  );
}
