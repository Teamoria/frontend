import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";
import { uploads } from "../data/teamoriaData.js";

const pipelineSteps = [
  { name: "Upload", status: "completed" },
  { name: "Extract", status: "completed" },
  { name: "Transcribe", status: "current" },
  { name: "AI Summary", status: "upcoming" },
  { name: "Index", status: "upcoming" }
];

export default function UploadCenterPage() {
  return (
    <AppShell active="Upload Center">
      <PageHeader
        title="Upload Center"
        eyebrow="PDF, DOCX, audio, video, images, and meeting recordings."
        actions={<button className="product-button" type="button">Select Files</button>}
      />

      <section className="upload-layout">
        <Panel title="Upload Area">
          <div className="drop-zone">
            <strong>اسحب ملف الفيديو، الصوت، أو الـ PDF هنا لتحويله إلى شات بوت</strong>
            <p>Teamoria will transcribe, summarize, extract tasks, and generate a dedicated chatbot for this file.</p>
            <div className="file-type-row">
              {["PDF", "DOCX", "AUDIO", "VIDEO", "IMAGE", "TXT"].map((type) => <span key={type}>{type}</span>)}
            </div>
          </div>
          <div className="smart-processing-cards">
            {[
              ["TXT", "Automatic transcription", "Ready"],
              ["SUM", "Summary & tasks extraction", "Ready"],
              ["BOT", "Smart bot generation", "Ready"]
            ].map(([icon, title, status]) => (
              <article className="premium-card" key={title}>
                <span>{icon}</span>
                <b>{title}</b>
                <small>{status}</small>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Processing Status">
          <div className="processing-pipeline">
            <div className="pipeline-title">
              <b>Roadmap_Call.mp4</b>
              <span>Processing pipeline</span>
            </div>
            <div className="pipeline-track">
              {pipelineSteps.map((step, index) => (
                <div className={`pipeline-step pipeline-step--${step.status}`} key={step.name}>
                  <div className="pipeline-node">{step.status === "completed" ? "OK" : index + 1}</div>
                  <span>{step.name}</span>
                  {index !== pipelineSteps.length - 1 ? <i /> : null}
                </div>
              ))}
            </div>
          </div>
          <div className="upload-list">
            {uploads.map((file) => (
              <article className="premium-card" key={file.name}>
                <div>
                  <b>{file.name}</b>
                  <span>{file.type} - {file.status}</span>
                </div>
                <div className="progress-track"><span style={{ width: `${file.progress}%` }} /></div>
                <strong>{file.progress}%</strong>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="AI Summary">
          <p>Roadmap_Call.mp4 indicates one timeline risk, two staffing gaps, and four action items. The assistant will attach source citations after processing completes.</p>
        </Panel>

        <Panel title="Transcript & Extracted Tasks">
          <div className="extracted-grid">
            {["Speaker transcript", "Decisions", "Extracted tasks", "Source metadata"].map((item) => (
              <article key={item}><b>{item}</b><span>Ready for review and approval.</span></article>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
