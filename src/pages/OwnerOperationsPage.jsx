import {
  FiAlertTriangle,
  FiClock,
  FiEdit3,
  FiGrid,
  FiFileText,
  FiList,
  FiMessageCircle,
  FiMoreHorizontal,
  FiMove,
  FiPaperclip,
  FiPlus,
  FiShield,
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

const actionLabels = {
  edit: "Edit task",
  move: "Move task",
  note: "Add note",
  request: "Request changes",
  reject: "Reject / Cannot proceed"
};

const assigneeOptions = ["Sarah Johnson", "David Chen", "Marcus Wright", "Alex Rivera", "Jordan Diaz"];

function seedColumns(sourceColumns) {
  return sourceColumns.map((column, columnIndex) => ({
    ...column,
    tasks: column.tasks.map((task, taskIndex) => ({
      ...task,
      id: task.id || `owner-task-${columnIndex}-${taskIndex}`,
      notes: task.notes || [],
      status: task.status || ""
    }))
  }));
}

export default function OwnerOperationsPage() {
  const [boardColumns, setBoardColumns] = useState(() => seedColumns(columns));
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("board");
  const [openTaskMenu, setOpenTaskMenu] = useState(null);
  const [taskAction, setTaskAction] = useState(null);
  const taskRows = boardColumns.flatMap((column) => column.tasks.map((task, index) => ({
    ...task,
    rowId: task.id || `${column.title}-${task.title}-${index}`,
    stage: column.title,
    done: column.isDone
  })));
  const activeTask = taskAction ? findTask(boardColumns, taskAction.taskId) : null;

  function handleCreateTask(task) {
    setBoardColumns((currentColumns) => currentColumns.map((column) => {
      if (column.title !== "To Do") {
        return column;
      }

      return {
        ...column,
        count: column.count + 1,
        tasks: [{ ...task, id: `owner-task-${Date.now()}`, notes: [], status: "" }, ...column.tasks]
      };
    }));
    setIsTaskModalOpen(false);
  }

  function openAction(type, task) {
    setOpenTaskMenu(null);
    setTaskAction({ type, taskId: task.id });
  }

  function closeTaskAction() {
    setTaskAction(null);
  }

  function updateTask(taskId, updater) {
    setBoardColumns((currentColumns) => currentColumns.map((column) => ({
      ...column,
      tasks: column.tasks.map((task) => task.id === taskId ? updater(task, column) : task)
    })));
  }

  function moveTask(taskId, nextStage) {
    setBoardColumns((currentColumns) => {
      let movingTask = null;
      const columnsWithoutTask = currentColumns.map((column) => {
        const remainingTasks = column.tasks.filter((task) => {
          if (task.id === taskId) {
            movingTask = { ...task, status: task.status === "blocked" ? task.status : "" };
            return false;
          }
          return true;
        });
        return { ...column, count: remainingTasks.length, tasks: remainingTasks };
      });

      if (!movingTask) return currentColumns;

      return columnsWithoutTask.map((column) => {
        if (column.title !== nextStage) return column;
        const nextTasks = [movingTask, ...column.tasks];
        return { ...column, count: nextTasks.length, tasks: nextTasks };
      });
    });
  }

  function submitTaskAction(payload) {
    if (!taskAction || !activeTask) return;

    if (taskAction.type === "move") {
      moveTask(activeTask.id, payload.stage);
      closeTaskAction();
      return;
    }

    updateTask(activeTask.id, (task) => {
      if (taskAction.type === "edit") {
        return {
          ...task,
          title: payload.title,
          category: payload.category,
          priority: payload.priority,
          priorityTone: payload.priority.toLowerCase(),
          text: payload.description,
          due: payload.dueDate || task.due,
          avatars: [initials(payload.assignee)]
        };
      }

      if (taskAction.type === "note") {
        return {
          ...task,
          notes: [{ text: payload.message, time: "Just now" }, ...(task.notes || [])],
          status: task.status || "noted"
        };
      }

      if (taskAction.type === "request") {
        return {
          ...task,
          status: "changes_requested",
          requestMessage: payload.message,
          notes: [{ text: payload.message, time: "Change request" }, ...(task.notes || [])]
        };
      }

      if (taskAction.type === "reject") {
        return {
          ...task,
          status: "blocked",
          rejectionReason: payload.message,
          insightTone: "risk",
          insightTitle: "Blocked by owner",
          insight: payload.message
        };
      }

      return task;
    });
    closeTaskAction();
  }

  return (
    <AppShell active="Operations Board" role="Company Owner" roleId="owner" user="Company Owner">
      <section className="owner-operations-page">
        <div className="owner-operations-sticky-head">
          <div className="owner-operations-titlebar">
            <div>
              <h1>Operations Kanban</h1>
              <p>Manage cross-functional tasks with AI-powered risk assessment.</p>
            </div>
            <div className="owner-operations-actions">
              <div className="owner-operations-view-toggle" aria-label="View mode">
                <button className={viewMode === "board" ? "active" : ""} type="button" onClick={() => setViewMode("board")} aria-pressed={viewMode === "board"}><FiGrid aria-hidden="true" />Board</button>
                <button className={viewMode === "list" ? "active" : ""} type="button" onClick={() => setViewMode("list")} aria-pressed={viewMode === "list"}><FiList aria-hidden="true" />List</button>
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
        </div>

        {viewMode === "board" ? (
          <div className="owner-operations-board" aria-label="Operations task board">
            {boardColumns.map((column) => (
              <section className={`owner-kanban-column tone-${column.tone} ${column.isDone ? "is-done" : ""}`} key={column.title}>
                <header>
                  <div>
                    <span />
                    <h2>{column.title}</h2>
                    <b>{column.tasks.length}</b>
                  </div>
                  <button type="button" aria-label={`${column.title} options`}>
                    <FiMoreHorizontal aria-hidden="true" />
                  </button>
                </header>
                <div className="owner-kanban-task-list">
                  {column.tasks.map((task) => (
                    <TaskCard
                      task={task}
                      key={task.id}
                      done={column.isDone}
                      menuOpen={openTaskMenu === task.id}
                      onMenuToggle={() => setOpenTaskMenu((current) => current === task.id ? null : task.id)}
                      onAction={openAction}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <section className="owner-operations-list-view" aria-label="Operations task list">
            <div className="owner-operations-list-head" aria-hidden="true">
              <span>Task</span>
              <span>Stage</span>
              <span>Priority</span>
              <span>Assignee</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            <div className="owner-operations-list-rows">
              {taskRows.map((task) => (
                <TaskListRow
                  task={task}
                  key={task.rowId}
                  menuOpen={openTaskMenu === task.id}
                  onMenuToggle={() => setOpenTaskMenu((current) => current === task.id ? null : task.id)}
                  onAction={openAction}
                />
              ))}
            </div>
          </section>
        )}

        {isTaskModalOpen ? <CreateTaskModal onClose={() => setIsTaskModalOpen(false)} onCreate={handleCreateTask} /> : null}
        {taskAction && activeTask ? (
          <TaskActionModal
            actionType={taskAction.type}
            columns={boardColumns}
            onClose={closeTaskAction}
            onSubmit={submitTaskAction}
            task={activeTask}
          />
        ) : null}
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
        <header className="create-owner-task-hero">
          <div>
            <span className="create-owner-task-kicker">Owner command task</span>
            <h2 id="create-owner-task-title">Create New Task</h2>
            <p>Assign work with project context and optional AI risk review before it enters the board.</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose}>
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="create-owner-task-body">
          <div className="create-owner-task-summary" aria-label="Task setup summary">
            <span><FiShield aria-hidden="true" />Owner visible</span>
            <span><FiClock aria-hidden="true" />{form.dueDate || "No due date"}</span>
            <span><FiZap aria-hidden="true" />{aiRiskEnabled ? "AI risk on" : "AI risk off"}</span>
          </div>

          <label>
            <span>Task title</span>
            <input name="title" value={form.title} onChange={updateField} placeholder="e.g., Optimize Neural Latency" autoFocus />
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
            <span>Task description</span>
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

function TaskCard({ task, done = false, menuOpen = false, onAction, onMenuToggle }) {
  const latestNote = task.notes?.[0];

  return (
    <article className={`owner-task-card ${done ? "is-complete" : ""}`}>
      <div className="owner-task-card-top">
        <span className="owner-task-category">{task.category}</span>
        <div className="owner-task-card-actions">
          {done ? <span className="owner-task-done">Done</span> : <span className={`owner-task-priority priority-${task.priorityTone}`}>{task.priority}</span>}
          <ActionMenu task={task} isOpen={menuOpen} onAction={onAction} onToggle={onMenuToggle} />
        </div>
      </div>
      <h3>{task.title}</h3>
      {task.text ? <p>{task.text}</p> : null}
      <TaskDecisionState task={task} />
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
      {latestNote ? (
        <div className="owner-task-note">
          <FiMessageCircle aria-hidden="true" />
          <span>{latestNote.text}</span>
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

function TaskListRow({ task, menuOpen = false, onAction, onMenuToggle }) {
  const progressLabel = typeof task.progress === "number" ? `${task.progress}% Complete` : task.due || task.completed || "Open";
  const latestNote = task.notes?.[0];

  return (
    <article className={`owner-operations-list-row ${task.done ? "is-complete" : ""}`}>
      <div className="owner-operations-list-main">
        <span className="owner-list-stage-dot" aria-hidden="true" />
        <div>
          <span className="owner-task-category">{task.category}</span>
          <h3>{task.title}</h3>
          {task.text ? <p>{task.text}</p> : null}
          <TaskDecisionState task={task} compact />
          {latestNote ? <small className="owner-list-note">Note: {latestNote.text}</small> : null}
        </div>
      </div>
      <span className="owner-operations-list-stage">{task.stage}</span>
      {task.done ? <span className="owner-task-done">Done</span> : <span className={`owner-task-priority priority-${task.priorityTone}`}>{task.priority}</span>}
      <div className="owner-task-avatars">
        {(task.avatars || ["--"]).map((avatar) => <span key={avatar}>{avatar}</span>)}
      </div>
      <div className="owner-operations-list-status">
        <strong>{progressLabel}</strong>
        {task.insight ? (
          <span className={`owner-operations-list-insight insight-${task.insightTone}`}>
            {task.insightTone === "risk" ? <FiAlertTriangle aria-hidden="true" /> : <FiZap aria-hidden="true" />}
            {task.insightTitle}
          </span>
        ) : null}
      </div>
      <ActionMenu task={task} isOpen={menuOpen} onAction={onAction} onToggle={onMenuToggle} />
    </article>
  );
}

function ActionMenu({ task, isOpen, onAction, onToggle }) {
  return (
    <div className="owner-task-action-wrap">
      <button className="owner-task-action-button" type="button" aria-label={`Actions for ${task.title}`} aria-expanded={isOpen} onClick={onToggle}>
        <FiMoreHorizontal aria-hidden="true" />
      </button>
      {isOpen ? (
        <div className="owner-task-action-menu">
          <button type="button" onClick={() => onAction("edit", task)}><FiEdit3 aria-hidden="true" />Edit task</button>
          <button type="button" onClick={() => onAction("move", task)}><FiMove aria-hidden="true" />Move task</button>
          <button type="button" onClick={() => onAction("note", task)}><FiMessageCircle aria-hidden="true" />Add note</button>
          <button type="button" onClick={() => onAction("request", task)}><FiFileText aria-hidden="true" />Request changes</button>
          <button className="danger" type="button" onClick={() => onAction("reject", task)}><FiAlertTriangle aria-hidden="true" />Reject / cannot proceed</button>
        </div>
      ) : null}
    </div>
  );
}

function TaskDecisionState({ task, compact = false }) {
  if (!task.status && !task.requestMessage && !task.rejectionReason) return null;

  const statusCopy = {
    noted: "Note added",
    changes_requested: "Changes requested",
    blocked: "Cannot proceed"
  };
  const message = task.rejectionReason || task.requestMessage || "";

  return (
    <div className={`owner-task-decision owner-task-decision--${task.status || "noted"} ${compact ? "is-compact" : ""}`}>
      <b>{statusCopy[task.status] || "Updated"}</b>
      {message ? <span>{message}</span> : null}
    </div>
  );
}

function TaskActionModal({ actionType, columns, onClose, onSubmit, task }) {
  const [form, setForm] = useState(() => ({
    title: task.title || "",
    category: task.category || "Infrastructure",
    assignee: assigneeNameFromTask(task),
    dueDate: task.due && !task.due.includes(" ") ? task.due : "",
    description: task.text || "",
    priority: task.priority || "Medium",
    stage: findTaskStage(columns, task.id) || "To Do",
    message: ""
  }));
  const isEdit = actionType === "edit";
  const isMove = actionType === "move";
  const requiresMessage = ["note", "request", "reject"].includes(actionType);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (requiresMessage && !form.message.trim()) return;
    onSubmit({ ...form, message: form.message.trim() });
  }

  return (
    <div className="owner-task-action-backdrop" role="presentation">
      <form className="owner-task-action-modal" role="dialog" aria-modal="true" aria-labelledby="owner-task-action-title" onSubmit={submit}>
        <header>
          <div>
            <span>{task.title}</span>
            <h2 id="owner-task-action-title">{actionLabels[actionType]}</h2>
          </div>
          <button type="button" aria-label="Close" onClick={onClose}><FiX aria-hidden="true" /></button>
        </header>

        <div className="owner-task-action-body">
          {isEdit ? (
            <>
              <label>
                <span>Task title</span>
                <input autoFocus name="title" value={form.title} onChange={updateField} />
              </label>
              <div className="owner-task-action-grid">
                <label>
                  <span>Category</span>
                  <select name="category" value={form.category} onChange={updateField}>
                    <option>Engineering</option>
                    <option>Infrastructure</option>
                    <option>Security</option>
                    <option>UI/UX</option>
                    <option>Legacy</option>
                  </select>
                </label>
                <label>
                  <span>Priority</span>
                  <select name="priority" value={form.priority} onChange={updateField}>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </label>
              </div>
              <div className="owner-task-action-grid">
                <label>
                  <span>Assignee</span>
                  <select name="assignee" value={form.assignee} onChange={updateField}>
                    {assigneeOptions.map((assignee) => <option key={assignee}>{assignee}</option>)}
                  </select>
                </label>
                <label>
                  <span>Due date</span>
                  <input name="dueDate" type="date" value={form.dueDate} onChange={updateField} />
                </label>
              </div>
              <label>
                <span>Description</span>
                <textarea name="description" rows="4" value={form.description} onChange={updateField} />
              </label>
            </>
          ) : null}

          {isMove ? (
            <label>
              <span>Move to stage</span>
              <select autoFocus name="stage" value={form.stage} onChange={updateField}>
                {columns.map((column) => <option key={column.title}>{column.title}</option>)}
              </select>
            </label>
          ) : null}

          {requiresMessage ? (
            <label>
              <span>{actionType === "note" ? "Note" : actionType === "request" ? "Manager message" : "Reason"}</span>
              <textarea
                autoFocus
                name="message"
                rows="5"
                value={form.message}
                onChange={updateField}
                placeholder={actionType === "note" ? "Write a quick operational note..." : actionType === "request" ? "Explain what needs to be changed before this can continue..." : "Explain why this task cannot proceed..."}
              />
            </label>
          ) : null}
        </div>

        <footer>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">{actionType === "move" ? "Move task" : actionType === "edit" ? "Save changes" : "Submit"}</button>
        </footer>
      </form>
    </div>
  );
}

function findTask(columns, taskId) {
  for (const column of columns) {
    const task = column.tasks.find((item) => item.id === taskId);
    if (task) return task;
  }
  return null;
}

function findTaskStage(columns, taskId) {
  return columns.find((column) => column.tasks.some((task) => task.id === taskId))?.title;
}

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function assigneeNameFromTask(task) {
  const avatar = task.avatars?.[0];
  return assigneeOptions.find((name) => initials(name) === avatar) || assigneeOptions[0];
}
