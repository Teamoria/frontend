import {
  FiAlertTriangle,
  FiClock,
  FiMessageCircle,
  FiMoreHorizontal,
  FiPaperclip,
  FiPlus,
  FiSearch,
  FiX,
  FiZap
} from "react-icons/fi";
import { useState } from "react";
import AppShell from "../components/app/AppShell.jsx";
import "../styles/owner-operations.css";

const columns = [
  {
    title: "To Do",
    count: 3,
    tone: "muted",
    tasks: [
      {
        title: "Optimize Neural Latency",
        category: "Engineering",
        priority: "High",
        priorityTone: "high",
        text: "Reduce inference response time by 15% across global endpoints.",
        insightTone: "risk",
        insightTitle: "AI Risk Indicator",
        insight: "Likely delayed: resource conflict detected in cluster B.",
        avatars: ["AR"],
        comments: 4,
        files: 2
      },
      {
        title: "Vault Integration Audit",
        category: "Security",
        priority: "Medium",
        priorityTone: "medium",
        avatars: ["MK"],
        due: "Tomorrow"
      }
    ]
  },
  {
    title: "In Progress",
    count: 2,
    tone: "primary",
    tasks: [
      {
        title: "Global Edge Deployment",
        category: "Infrastructure",
        priority: "High",
        priorityTone: "high",
        progress: 65,
        insightTone: "positive",
        insightTitle: "AI Pulse",
        insight: "Optimal performance: resource utilization at 92% efficiency.",
        avatars: ["JD", "LW"]
      }
    ]
  },
  {
    title: "Review",
    count: 1,
    tone: "dark",
    tasks: [
      {
        title: "Accessibility Compliance",
        category: "UI/UX",
        priority: "Low",
        priorityTone: "low",
        avatars: ["TR"],
        due: "Needs Lead Sign-off"
      }
    ]
  },
  {
    title: "Done",
    count: 12,
    tone: "done",
    isDone: true,
    tasks: [
      {
        title: "API Migration Phase 1",
        category: "Legacy",
        completed: "Completed on Oct 14, 2023"
      }
    ]
  }
];

export default function OwnerOperationsPage() {
  const [boardColumns, setBoardColumns] = useState(columns);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  function handleCreateTask(task) {
    setBoardColumns((currentColumns) => currentColumns.map((column) => {
      if (column.title !== "To Do") {
        return column;
      }

      return {
        ...column,
        count: column.count + 1,
        tasks: [task, ...column.tasks]
      };
    }));
    setIsTaskModalOpen(false);
  }

  return (
    <AppShell active="Operations Board" role="Company Owner" roleId="owner" user="Company Owner">
      <section className="owner-operations-page">
        <div className="owner-operations-head">
          <label className="owner-operations-search">
            <FiSearch aria-hidden="true" />
            <input placeholder="Search tasks, projects, or AI insights..." />
          </label>
          <div className="owner-operations-sync">
            <FiClock aria-hidden="true" />
            <span>Last sync: 2m ago</span>
          </div>
        </div>

        <div className="owner-operations-titlebar">
          <div>
            <h1>Operations Kanban</h1>
            <p>Manage cross-functional tasks with AI-powered risk assessment.</p>
          </div>
          <div className="owner-operations-actions">
            <div className="owner-operations-view-toggle" aria-label="View mode">
              <button className="active" type="button">Board</button>
              <button type="button">List</button>
            </div>
            <button className="owner-operations-new-task" type="button" onClick={() => setIsTaskModalOpen(true)}>
              <FiPlus aria-hidden="true" />
              New Task
            </button>
          </div>
        </div>

        <div className="owner-operations-filterbar">
          <label>
            <span>Filter by:</span>
            <select defaultValue="all">
              <option value="all">All Projects</option>
              <option value="quantum">Quantum Infrastructure</option>
              <option value="security">AI Security Audit</option>
            </select>
          </label>
          <div className="owner-operations-assignees">
            <span>Assignee:</span>
            <div>
              <i>JD</i>
              <i>AM</i>
              <button type="button" aria-label="Add assignee"><FiPlus aria-hidden="true" /></button>
            </div>
          </div>
        </div>

        <div className="owner-operations-board" aria-label="Operations task board">
          {boardColumns.map((column) => (
            <section className={`owner-kanban-column tone-${column.tone} ${column.isDone ? "is-done" : ""}`} key={column.title}>
              <header>
                <div>
                  <span />
                  <h2>{column.title}</h2>
                  <b>{column.count}</b>
                </div>
                <button type="button" aria-label={`${column.title} options`}>
                  <FiMoreHorizontal aria-hidden="true" />
                </button>
              </header>
              <div className="owner-kanban-task-list">
                {column.tasks.map((task) => <TaskCard task={task} key={task.title} done={column.isDone} />)}
              </div>
            </section>
          ))}
        </div>

        <button className="owner-operations-ai-button" type="button">
          <FiZap aria-hidden="true" />
          <span>AI Optimization Suggestions</span>
        </button>
        {isTaskModalOpen ? <CreateTaskModal onClose={() => setIsTaskModalOpen(false)} onCreate={handleCreateTask} /> : null}
      </section>
    </AppShell>
  );
}

function CreateTaskModal({ onClose, onCreate }) {
  const [priority, setPriority] = useState("High");
  const [aiRiskEnabled, setAiRiskEnabled] = useState(true);
  const [form, setForm] = useState({
    title: "",
    assignee: "Sarah Johnson",
    dueDate: "",
    project: "Quantum Infrastructure",
    description: ""
  });

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function submitTask(event) {
    event.preventDefault();
    const title = form.title.trim() || "Untitled Owner Task";
    const assigneeInitials = form.assignee.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    const category = form.project.includes("Security") ? "Security" : form.project.includes("Neural") ? "Engineering" : "Infrastructure";

    onCreate({
      title,
      category,
      priority,
      priorityTone: priority.toLowerCase(),
      text: form.description.trim() || "Owner-created task awaiting detailed requirements.",
      insightTone: priority === "High" ? "risk" : "positive",
      insightTitle: aiRiskEnabled ? "AI Risk Assessment" : "Owner Task",
      insight: aiRiskEnabled
        ? priority === "High"
          ? "Potential delay risk detected. Review workload and timeline before assignment."
          : "No major conflicts detected from the current owner inputs."
        : "AI risk assessment disabled for this task.",
      avatars: [assigneeInitials],
      due: form.dueDate || "No due date"
    });
  }

  return (
    <div className="create-owner-task-backdrop" role="presentation">
      <form className="create-owner-task-modal" role="dialog" aria-modal="true" aria-labelledby="create-owner-task-title" onSubmit={submitTask}>
        <header>
          <h2 id="create-owner-task-title">Create New Task</h2>
          <button type="button" aria-label="Close" onClick={onClose}>
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="create-owner-task-body">
          <label>
            <span>Task Title</span>
            <input name="title" value={form.title} onChange={updateField} placeholder="e.g., Optimize Neural Latency" />
          </label>

          <div className="create-owner-task-grid">
            <label>
              <span>Assignee</span>
              <select name="assignee" value={form.assignee} onChange={updateField}>
                <option>Sarah Johnson</option>
                <option>David Chen</option>
                <option>Marcus Wright</option>
              </select>
            </label>
            <label>
              <span>Due Date</span>
              <input name="dueDate" type="date" value={form.dueDate} onChange={updateField} />
            </label>
          </div>

          <label>
            <span>Project</span>
            <select name="project" value={form.project} onChange={updateField}>
              <option>Quantum Infrastructure</option>
              <option>AI Security Audit</option>
              <option>Neural Network Optimization</option>
            </select>
          </label>

          <fieldset className="create-owner-task-priority">
            <legend>Priority</legend>
            {["High", "Medium", "Low"].map((item) => (
              <button className={priority === item ? "active" : ""} type="button" key={item} onClick={() => setPriority(item)}>
                {item}
              </button>
            ))}
          </fieldset>

          <label>
            <span>Task Description</span>
            <textarea name="description" value={form.description} onChange={updateField} placeholder="Describe the task requirements..." rows="3" />
          </label>

          <button
            className={`create-owner-task-ai-toggle ${aiRiskEnabled ? "active" : ""}`}
            type="button"
            onClick={() => setAiRiskEnabled((enabled) => !enabled)}
          >
            <FiZap aria-hidden="true" />
            <span>
              <b>AI-Powered Risk Assessment</b>
              <small>Predict potential delays and resource conflicts</small>
            </span>
            <i />
          </button>
        </div>

        <footer>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Create Task</button>
        </footer>
      </form>
    </div>
  );
}

function TaskCard({ task, done = false }) {
  return (
    <article className={`owner-task-card ${done ? "is-complete" : ""}`}>
      <div className="owner-task-card-top">
        <span className="owner-task-category">{task.category}</span>
        {done ? <span className="owner-task-done">Done</span> : <span className={`owner-task-priority priority-${task.priorityTone}`}>{task.priority}</span>}
      </div>
      <h3>{task.title}</h3>
      {task.text ? <p>{task.text}</p> : null}
      {typeof task.progress === "number" ? (
        <div className="owner-task-progress">
          <i style={{ width: `${task.progress}%` }} />
        </div>
      ) : null}
      {task.insight ? (
        <div className={`owner-task-insight insight-${task.insightTone}`}>
          {task.insightTone === "risk" ? <FiAlertTriangle aria-hidden="true" /> : <FiZap aria-hidden="true" />}
          <div>
            <b>{task.insightTitle}</b>
            <span>{task.insight}</span>
          </div>
        </div>
      ) : null}
      <footer>
        <div className="owner-task-avatars">
          {(task.avatars || []).map((avatar) => <span key={avatar}>{avatar}</span>)}
        </div>
        {task.comments || task.files ? (
          <div className="owner-task-meta">
            {task.comments ? <span><FiMessageCircle aria-hidden="true" />{task.comments}</span> : null}
            {task.files ? <span><FiPaperclip aria-hidden="true" />{task.files}</span> : null}
          </div>
        ) : null}
        {task.due ? <span className="owner-task-due"><FiClock aria-hidden="true" />{task.due}</span> : null}
        {task.progress ? <strong>{task.progress}% Complete</strong> : null}
        {task.completed ? <small>{task.completed}</small> : null}
      </footer>
    </article>
  );
}
