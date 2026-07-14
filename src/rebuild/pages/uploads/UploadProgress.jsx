import { FiAlertTriangle, FiCheckCircle, FiClock, FiLoader } from "react-icons/fi";
import { Progress } from "../../ui.jsx";
import { formatUploadSize } from "./uploadStatus.js";

function progressIcon(status) {
  if (status === "completed") return <FiCheckCircle aria-hidden="true" />;
  if (status === "failed") return <FiAlertTriangle aria-hidden="true" />;
  if (status === "uploading") return <FiLoader aria-hidden="true" className="t2-spin" />;
  return <FiClock aria-hidden="true" />;
}

export default function UploadProgress({ files, state }) {
  if (!files.length) return null;

  const status = state?.status || "idle";
  const percent = status === "completed" ? 100 : Math.max(0, Math.min(100, Number(state?.percent) || 0));

  return (
    <div className="upload-progress-list" aria-live="polite">
      {files.map((file) => (
        <article className={`upload-progress-row is-${status}`} key={`${file.name}-${file.size}-${file.lastModified}`}>
          <span className="upload-progress-row__icon">{progressIcon(status)}</span>
          <div>
            <b>{file.name}</b>
            <small>{formatUploadSize(file.size)} - {status === "idle" ? "Ready" : status}</small>
            <Progress label={`${file.name}: ${percent}%`} value={percent} />
          </div>
          <strong>{percent}%</strong>
        </article>
      ))}
      {state?.error ? <p className="t2-form-alert is-error" role="alert">{state.error}</p> : null}
    </div>
  );
}
