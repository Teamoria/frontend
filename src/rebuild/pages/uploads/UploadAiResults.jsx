import { useMemo, useState } from "react";
import { FiAlertCircle, FiCheckSquare, FiFileText, FiList, FiMessageSquare, FiScissors } from "react-icons/fi";
import { getProcessingStatus, isFailedUpload, shouldPollUpload } from "./uploadStatus.js";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function readText(value) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    return value.text || value.content || value.summary || value.title || value.description || JSON.stringify(value, null, 2);
  }
  return String(value);
}

function stripPrivateFields(item) {
  if (!item || typeof item !== "object") return {};
  const blocked = new Set(["embedding", "embeddings", "vector", "vectors", "path", "storage_path", "file_path", "disk", "url"]);
  return Object.fromEntries(Object.entries(item).filter(([key]) => !blocked.has(String(key).toLowerCase())));
}

function getAiData(upload) {
  const transcript = readText(upload?.transcript || upload?.transcription || upload?.text);
  const summary = readText(upload?.summary);
  const decisions = asArray(upload?.decisions || upload?.decision_items).filter(Boolean);
  const tasks = asArray(upload?.tasks || upload?.task_items || upload?.extracted_tasks).filter(Boolean);
  const chunks = asArray(upload?.knowledge_chunks || upload?.chunks || upload?.chunk_items).filter(Boolean);
  return { transcript, summary, decisions, tasks, chunks };
}

function hasAnyResult(data) {
  return Boolean(data.transcript || data.summary || data.decisions.length || data.tasks.length || data.chunks.length);
}

function ResultCard({ children, icon: Icon, title }) {
  return (
    <article className="upload-ai-card">
      <header>
        {Icon ? <Icon aria-hidden="true" /> : null}
        <h4>{title}</h4>
      </header>
      {children}
    </article>
  );
}

function TextBlock({ text }) {
  return <p className="upload-ai-text">{text}</p>;
}

function ItemList({ items, renderItem }) {
  return (
    <div className="upload-ai-list">
      {items.map((item, index) => (
        <article key={item?.id || item?.uuid || index}>
          <span>{index + 1}</span>
          <div>{renderItem(item, index)}</div>
        </article>
      ))}
    </div>
  );
}

export default function UploadAiResults({ local, upload }) {
  const data = useMemo(() => getAiData(upload), [upload]);
  const processingStatus = getProcessingStatus(upload);
  const failed = isFailedUpload(upload);
  const processing = shouldPollUpload(upload);
  const tabs = [
    data.summary ? { key: "overview", label: local.aiOverview } : null,
    data.transcript ? { key: "transcript", label: local.aiTranscript } : null,
    data.decisions.length ? { key: "decisions", label: local.aiDecisions } : null,
    data.tasks.length ? { key: "tasks", label: local.aiTasks } : null,
    data.chunks.length ? { key: "chunks", label: local.aiChunks } : null
  ].filter(Boolean);
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || "overview");
  const currentTab = tabs.some((tab) => tab.key === activeTab) ? activeTab : tabs[0]?.key;

  if (failed) {
    return (
      <section className="upload-ai-results upload-ai-results--state" aria-label={local.aiResults}>
        <FiAlertCircle aria-hidden="true" />
        <h3>{local.aiFailed}</h3>
        {upload?.processing_error ? <p>{upload.processing_error}</p> : null}
      </section>
    );
  }

  if (processing) {
    return (
      <section className="upload-ai-results upload-ai-results--state" aria-label={local.aiResults}>
        <FiScissors aria-hidden="true" />
        <h3>{local.aiProcessing}</h3>
        <p>{processingStatus}</p>
      </section>
    );
  }

  if (!hasAnyResult(data)) {
    return (
      <section className="upload-ai-results upload-ai-results--state" aria-label={local.aiResults}>
        <FiFileText aria-hidden="true" />
        <h3>{local.aiEmpty}</h3>
      </section>
    );
  }

  return (
    <section className="upload-ai-results" aria-label={local.aiResults}>
      <header className="upload-ai-results__header">
        <div>
          <h3>{local.aiResults}</h3>
          <p>{local.aiResultsText}</p>
        </div>
        <div className="upload-ai-tabs" role="tablist" aria-label={local.aiResults}>
          {tabs.map((tab) => (
            <button
              aria-selected={currentTab === tab.key}
              className={currentTab === tab.key ? "is-active" : ""}
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {currentTab === "overview" && data.summary ? (
        <ResultCard icon={FiMessageSquare} title={local.aiSummary}>
          <TextBlock text={data.summary} />
        </ResultCard>
      ) : null}

      {currentTab === "transcript" && data.transcript ? (
        <ResultCard icon={FiFileText} title={local.aiTranscript}>
          <pre className="upload-ai-transcript">{data.transcript}</pre>
        </ResultCard>
      ) : null}

      {currentTab === "decisions" && data.decisions.length ? (
        <ResultCard icon={FiList} title={local.aiDecisions}>
          <ItemList items={data.decisions} renderItem={(item) => <TextBlock text={readText(item)} />} />
        </ResultCard>
      ) : null}

      {currentTab === "tasks" && data.tasks.length ? (
        <ResultCard icon={FiCheckSquare} title={local.aiTasks}>
          <ItemList items={data.tasks} renderItem={(item) => (
            <>
              <b>{readText(item?.title || item?.name || item)}</b>
              {item?.description ? <p>{readText(item.description)}</p> : null}
            </>
          )} />
        </ResultCard>
      ) : null}

      {currentTab === "chunks" && data.chunks.length ? (
        <ResultCard icon={FiScissors} title={local.aiChunks}>
          <div className="upload-ai-chunks">
            {data.chunks.map((chunk, index) => {
              const safeChunk = stripPrivateFields(chunk);
              const content = readText(safeChunk.content || safeChunk.text || safeChunk);
              const meta = Object.entries(safeChunk).filter(([key]) => !["content", "text"].includes(key));
              return (
                <details key={chunk?.id || chunk?.uuid || index}>
                  <summary>{local.aiChunk} {index + 1}</summary>
                  <p>{content}</p>
                  {meta.length ? (
                    <dl>
                      {meta.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{readText(value)}</dd></div>)}
                    </dl>
                  ) : null}
                </details>
              );
            })}
          </div>
        </ResultCard>
      ) : null}
    </section>
  );
}
