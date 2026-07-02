import {
  FiDownload,
  FiFileText,
  FiFilter,
  FiMic,
  FiSearch,
  FiUploadCloud,
  FiVideo
} from "react-icons/fi";
import AppShell from "../components/app/AppShell.jsx";
import "../styles/owner-upload-center.css";

const processingFiles = [
  { name: "Q4_Market_Report.pdf", size: "14.2 MB", status: "Transcribing", progress: 75, type: "pdf" },
  { name: "Workshop_V2.mp4", size: "1.2 GB", status: "Generating Summary", progress: 42, type: "video" },
  { name: "Stakeholder_Interview.wav", size: "88.5 MB", status: "Vectorizing", progress: 90, type: "audio" }
];

const knowledgeAssets = [
  {
    name: "Annual_Compliance_Audit_2023.pdf",
    type: "PDF Document",
    date: "Oct 24, 2023 09:12 AM",
    tags: ["Compliance", "Audit"],
    icon: FiFileText
  },
  {
    name: "Product_Strategy_Q1_Townhall.mp4",
    type: "MP4 Video",
    date: "Oct 23, 2023 04:45 PM",
    tags: ["Strategy", "Roadmap"],
    icon: FiVideo
  },
  {
    name: "Client_Briefing_Call_Log_01.mp3",
    type: "MP3 Audio",
    date: "Oct 22, 2023 11:30 AM",
    tags: ["CRM", "Briefing"],
    icon: FiMic
  }
];

export default function OwnerUploadCenterPage() {
  return (
    <AppShell active="Upload Center" role="Company Owner" roleId="owner" user="Company Owner">
      <section className="owner-upload-page">
        <div className="owner-upload-toprow">
          <label className="owner-upload-search">
            <FiSearch aria-hidden="true" />
            <input placeholder="Search knowledge assets..." />
          </label>
        </div>

        <header className="owner-upload-header">
          <h1>Upload Center</h1>
          <p>Centralize your knowledge. Teamoria AI automatically processes and indexes your files.</p>
        </header>

        <section className="owner-upload-dropzone">
          <FiUploadCloud aria-hidden="true" />
          <h2>Drag and drop files to upload</h2>
          <p>Support for PDF documents, Audio (MP3, WAV), and Video (MP4) files up to 2GB each.</p>
          <button type="button">Browse Files</button>
        </section>

        <section className="owner-upload-processing">
          <div className="owner-upload-section-head">
            <h2>Active Processing</h2>
            <span>3 Files Remaining</span>
          </div>
          <div className="owner-upload-processing-grid">
            {processingFiles.map((file) => <ProcessingCard file={file} key={file.name} />)}
          </div>
        </section>

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
                    <th>AI Insights</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {knowledgeAssets.map((asset) => {
                    const Icon = asset.icon;

                    return (
                      <tr key={asset.name}>
                        <td>
                          <Icon aria-hidden="true" />
                          <span>{asset.name}</span>
                        </td>
                        <td>{asset.type}</td>
                        <td>{asset.date}</td>
                        <td>
                          <div className="owner-upload-tags">
                            {asset.tags.map((tag) => <span key={tag}>{tag}</span>)}
                          </div>
                        </td>
                        <td><button type="button">View AI Summary</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function ProcessingCard({ file }) {
  const Icon = file.type === "video" ? FiVideo : file.type === "audio" ? FiMic : FiFileText;

  return (
    <article className="owner-upload-processing-card">
      <div className="owner-upload-processing-card-head">
        <div>
          <span><Icon aria-hidden="true" /></span>
          <div>
            <h3>{file.name}</h3>
            <small>{file.size}</small>
          </div>
        </div>
        <em>{file.status}</em>
      </div>
      <div className="owner-upload-progress-row">
        <div>
          <span>AI Progress</span>
          <b>{file.progress}%</b>
        </div>
        <i><strong style={{ width: `${file.progress}%` }} /></i>
      </div>
    </article>
  );
}
