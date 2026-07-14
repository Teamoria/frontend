import { useState } from "react";
import { FiAlertTriangle, FiTrash2, FiX } from "react-icons/fi";
import { Button } from "../../ui.jsx";

export default function UploadDeleteAction({ copy, local, onDelete, uploadName }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirmDelete() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await onDelete();
      setConfirming(false);
    } catch (requestError) {
      setError(requestError?.message || copy.failedSave);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="upload-delete-action" aria-labelledby="upload-delete-title">
      <header>
        <span aria-hidden="true"><FiAlertTriangle /></span>
        <div>
          <h3 id="upload-delete-title">{local.deleteTitle}</h3>
          <p>{local.deleteText}</p>
        </div>
      </header>

      {confirming ? (
        <div className="upload-delete-confirm">
          <p>{local.deleteConfirm} <b>{uploadName}</b></p>
          {error ? <p className="t2-form-alert is-error" role="alert">{error}</p> : null}
          <div>
            <Button disabled={loading} icon={FiX} onClick={() => setConfirming(false)} tone="secondary">{copy.cancel}</Button>
            <Button icon={FiTrash2} loading={loading} loadingLabel={copy.loading} onClick={confirmDelete}>{local.deleteConfirmButton}</Button>
          </div>
        </div>
      ) : (
        <Button icon={FiTrash2} onClick={() => setConfirming(true)} tone="secondary">{local.deleteButton}</Button>
      )}
    </section>
  );
}
