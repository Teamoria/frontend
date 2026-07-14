import { useEffect, useState } from "react";
import { FiEye, FiRefreshCw } from "react-icons/fi";
import { Button, ErrorState, LoadingState } from "../../ui.jsx";
import { canAttemptPreview, getUploadId, previewKind } from "./uploadStatus.js";

export default function UploadPreview({ copy, local, onLoadPreview, upload }) {
  const [state, setState] = useState({ status: "idle", error: "", url: "", text: "", kind: "" });
  const uploadId = getUploadId(upload);
  const supported = canAttemptPreview(upload);

  useEffect(() => {
    return () => {
      if (state.url) URL.revokeObjectURL(state.url);
    };
  }, [state.url]);

  function clearObjectUrl() {
    if (state.url) URL.revokeObjectURL(state.url);
  }

  async function loadPreview() {
    if (!uploadId || !supported) return;
    clearObjectUrl();
    setState({ status: "loading", error: "", url: "", text: "", kind: "" });
    try {
      const result = await onLoadPreview(uploadId);
      const blob = result?.blob;
      const kind = previewKind(upload, blob?.type);
      if (!blob || kind === "unsupported") {
        setState({ status: "unsupported", error: "", url: "", text: "", kind: "unsupported" });
        return;
      }
      if (kind === "text") {
        setState({ status: "ready", error: "", url: "", text: await blob.text(), kind });
        return;
      }
      setState({ status: "ready", error: "", url: URL.createObjectURL(blob), text: "", kind });
    } catch (error) {
      setState({ status: "error", error: error?.message || copy.failedLoad, url: "", text: "", kind: "" });
    }
  }

  if (!uploadId) return null;

  return (
    <section className="upload-preview">
      <header>
        <h3>{local.preview}</h3>
        {supported ? <Button icon={state.status === "error" ? FiRefreshCw : FiEye} loading={state.status === "loading"} loadingLabel={copy.loading} onClick={loadPreview} tone="secondary">{state.status === "error" ? copy.retry : local.preview}</Button> : null}
      </header>
      {!supported ? <p className="upload-preview__empty">{local.previewUnsupported}</p> : null}
      {state.status === "loading" ? <LoadingState label={copy.loading} /> : null}
      {state.status === "error" ? <ErrorState onRetry={loadPreview} retryLabel={copy.retry} title={state.error || copy.failedLoad} /> : null}
      {state.status === "unsupported" ? <p className="upload-preview__empty">{local.previewUnsupported}</p> : null}
      {state.status === "ready" && state.kind === "image" ? <img alt="" src={state.url} /> : null}
      {state.status === "ready" && state.kind === "pdf" ? <iframe src={state.url} title={local.preview} /> : null}
      {state.status === "ready" && state.kind === "text" ? <pre>{state.text}</pre> : null}
    </section>
  );
}
