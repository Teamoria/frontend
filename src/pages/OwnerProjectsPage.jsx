import {
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiCheck,
  FiChevronsUp,
  FiDollarSign,
  FiFilter,
  FiFolder,
  FiInfo,
  FiLogOut,
  FiPlus,
  FiSearch,
  FiSliders,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import AppShell, { PageHeader } from "../components/app/AppShell.jsx";
import { useAuth } from "../lib/AuthContext.jsx";
import "../styles/owner-projects.css";

const summaryCards = [
  { label: "Total Active Projects", value: "124", detail: "+12% from last quarter", icon: FiFolder, tone: "primary" },
  { label: "Avg. Velocity", value: "42 pts/sprint", detail: "Stable across teams", icon: FiTrendingUp, tone: "secondary" },
  { label: "Upcoming Milestones", value: "18", detail: "3 at risk of delay", icon: FiTarget, tone: "warning" }
];

const ownerProjects = [
  {
    name: "Project Alpha - Nexus Integration",
    department: "Engineering Dept.",
    priority: "High",
    progress: 75,
    team: ["LA", "MT", "+4"],
    teamLabel: "Lead & Devs",
    health: "92/100",
    status: "Active"
  },
  {
    name: "Q3 Marketing Campaign: Horizons",
    department: "Marketing Dept.",
    priority: "Medium",
    progress: 40,
    team: ["NE", "+2"],
    teamLabel: "Marketing Ops",
    health: "65/100",
    status: "At Risk"
  },
  {
    name: "System Security Audit v2.4",
    department: "IT & Ops Dept.",
    priority: "High",
    progress: 10,
    team: ["RS"],
    teamLabel: "Security Lead",
    health: "88/100",
    status: "Pending"
  }
];

export default function OwnerProjectsPage() {
  const { logout } = useAuth();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  return (
    <AppShell active="Projects" role="Company Owner" roleId="owner" user="Company Owner">
      <div className="owner-projects-toolbar">
        <label className="owner-projects-search">
          <FiSearch aria-hidden="true" />
          <input placeholder="Search projects, tasks, or personnel..." />
        </label>
        <div className="owner-projects-toolbar-actions">
          <button className="owner-projects-primary" type="button" onClick={() => setIsProjectModalOpen(true)}>
            <FiPlus aria-hidden="true" />
            New Project
          </button>
          <span className="owner-projects-ai-status">
            <FiZap aria-hidden="true" />
            AI Status
          </span>
        </div>
      </div>

      <PageHeader
        title="Projects Directory"
        eyebrow="Manage and track enterprise initiatives across all departments."
        actions={(
          <>
            <button className="filter-button" type="button">
              <FiFilter aria-hidden="true" />
              Filters
            </button>
            <button className="filter-button" type="button">
              <FiSliders aria-hidden="true" />
              Sort By
            </button>
            <button className="owner-projects-logout" type="button" onClick={logout}>
              <FiLogOut aria-hidden="true" />
              Logout
            </button>
          </>
        )}
      />

      <section className="owner-projects-summary-grid">
        {summaryCards.map(({ detail, icon: Icon, label, tone, value }) => (
          <article className={`owner-projects-summary-card tone-${tone}`} key={label}>
            <div>
              <span>{label}</span>
              <i><Icon aria-hidden="true" /></i>
            </div>
            <strong>{value}</strong>
            <small>{tone === "warning" ? <FiAlertTriangle aria-hidden="true" /> : <FiTrendingUp aria-hidden="true" />}{detail}</small>
          </article>
        ))}
      </section>

      <section className="owner-projects-table-panel">
        <div className="owner-projects-table-wrap">
          <table className="owner-projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Priority</th>
                <th>Progress</th>
                <th>Team</th>
                <th>AI Health Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ownerProjects.map((project) => (
                <tr key={project.name}>
                  <td>
                    <b>{project.name}</b>
                    <span>{project.department}</span>
                  </td>
                  <td>
                    <span className={`owner-projects-priority priority-${project.priority.toLowerCase()}`}>
                      {project.priority === "High" ? <FiChevronsUp aria-hidden="true" /> : <FiArrowUp aria-hidden="true" />}
                      {project.priority}
                    </span>
                  </td>
                  <td>
                    <div className="owner-projects-progress">
                      <div><i style={{ width: `${project.progress}%` }} /></div>
                      <span>{project.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="owner-projects-team-cell">
                      <div className="owner-projects-avatar-stack">
                        {project.team.map((member) => <span key={member}>{member}</span>)}
                      </div>
                      <small>{project.teamLabel}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`owner-projects-health ${project.status === "At Risk" ? "health-risk" : ""}`}>
                      <i />
                      {project.health}
                    </span>
                  </td>
                  <td>
                    <span className={`owner-projects-status status-${project.status.toLowerCase().replace(" ", "-")}`}>
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="owner-projects-bottom-grid">
        <article>
          <FiUsers aria-hidden="true" />
          <div>
            <h3>Company Owner Baseline</h3>
            <p>This page is scoped for executive project oversight and can be used as the main owner projects screen.</p>
          </div>
        </article>
        <article>
          <FiZap aria-hidden="true" />
          <div>
            <h3>AI Health Review</h3>
            <p>Risk, progress, and health scores are grouped so managers can decide what needs attention first.</p>
          </div>
        </article>
      </section>

      {isProjectModalOpen ? <InitializeProjectModal onClose={() => setIsProjectModalOpen(false)} /> : null}
    </AppShell>
  );
}

function InitializeProjectModal({ onClose }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const progress = ((step - 1) / (totalSteps - 1)) * 100;

  function goNext() {
    if (step < totalSteps) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    onClose();
  }

  return (
    <div className="initialize-project-backdrop" role="presentation">
      <section className="initialize-project-modal" role="dialog" aria-modal="true" aria-labelledby="initialize-project-title">
        <header className="initialize-project-header">
          <div className="initialize-project-title-row">
            <div>
              <h2 id="initialize-project-title">Initialize New Project</h2>
              <p>Complete the steps below to setup your workspace.</p>
            </div>
            <button className="initialize-project-close" type="button" aria-label="Close" onClick={onClose}>
              <FiX aria-hidden="true" />
            </button>
          </div>

          <div className="initialize-project-steps" style={{ "--progress": `${progress}%` }}>
            {["General Info", "Timeline & Budget", "Team Setup", "AI Objectives"].map((label, index) => {
              const number = index + 1;
              const isDone = number < step;
              const isActive = number === step;

              return (
                <button
                  className={isActive ? "active" : isDone ? "done" : ""}
                  type="button"
                  key={label}
                  onClick={() => number <= step + 1 && setStep(number)}
                >
                  <span>{isDone ? <FiCheck aria-hidden="true" /> : number}</span>
                  <b>{label}</b>
                </button>
              );
            })}
          </div>
        </header>

        <div className="initialize-project-body">
          {step === 1 ? <GeneralInfoStep /> : null}
          {step === 2 ? <TimelineBudgetStep /> : null}
          {step === 3 ? <TeamSetupStep /> : null}
          {step === 4 ? <AiObjectivesStep /> : null}
        </div>

        <footer className="initialize-project-footer">
          <button
            className="initialize-project-secondary"
            type="button"
            disabled={step === 1}
            onClick={() => setStep((currentStep) => Math.max(1, currentStep - 1))}
          >
            <FiArrowLeft aria-hidden="true" />
            Back
          </button>
          <div>
            <button className="initialize-project-ghost" type="button">Save Draft</button>
            <button className="initialize-project-primary" type="button" onClick={goNext}>
              {step === totalSteps ? "Initialize Project" : "Continue"}
              {step === totalSteps ? <FiZap aria-hidden="true" /> : <FiArrowRight aria-hidden="true" />}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function GeneralInfoStep() {
  return (
    <section className="initialize-project-step">
      <h3>General Information</h3>
      <div className="initialize-project-fields">
        <label>
          <span>Project Name <em>*</em></span>
          <input placeholder="e.g., Q3 Marketing Campaign" />
        </label>
        <label>
          <span>Category</span>
          <select defaultValue="">
            <option disabled value="">Select a category</option>
            <option value="engineering">Engineering</option>
            <option value="marketing">Marketing</option>
            <option value="design">Design</option>
            <option value="operations">Operations</option>
          </select>
        </label>
        <label>
          <span>Description</span>
          <textarea placeholder="Briefly describe the project goals..." rows="4" />
        </label>
      </div>
    </section>
  );
}

function TimelineBudgetStep() {
  return (
    <section className="initialize-project-step">
      <h3>Timeline & Budget Allocation</h3>
      <div className="initialize-project-fields">
        <div className="initialize-project-two-col">
          <label>
            <span>Start Date</span>
            <input type="date" />
          </label>
          <label>
            <span>End Date</span>
            <input type="date" />
          </label>
        </div>
        <label>
          <span>Estimated Budget (USD)</span>
          <div className="initialize-project-money">
            <FiDollarSign aria-hidden="true" />
            <input placeholder="0.00" type="number" />
          </div>
        </label>
        <article className="initialize-project-note">
          <FiInfo aria-hidden="true" />
          <div>
            <h4>Budget Tracking</h4>
            <p>AI will automatically monitor expenses against this baseline and alert managers if variance exceeds 10%.</p>
          </div>
        </article>
      </div>
    </section>
  );
}

function TeamSetupStep() {
  return (
    <section className="initialize-project-step">
      <h3>Team Setup</h3>
      <div className="initialize-project-choice-grid">
        {["Engineering Lead", "Project Manager", "Marketing Ops", "Security Lead"].map((label) => (
          <label key={label}>
            <input type="checkbox" />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

function AiObjectivesStep() {
  return (
    <section className="initialize-project-step">
      <h3>AI Objectives</h3>
      <div className="initialize-project-choice-grid">
        {["Track delivery risks", "Summarize weekly progress", "Monitor budget variance", "Recommend resource changes"].map((label) => (
          <label key={label}>
            <input type="checkbox" defaultChecked={label === "Track delivery risks"} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

