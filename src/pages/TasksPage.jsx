import { useMemo, useState } from "react";
import AppShell from "../components/app/AppShell.jsx";
import { FiCalendar, FiChevronDown, FiFilter, FiGrid, FiList, FiMoreHorizontal, FiPlus, FiUser, FiZap } from "react-icons/fi";
import { useAuth } from "../lib/AuthContext.jsx";
import "../styles/tasks.css";

const emptyTask = {
  title: "",
  owner: "Alex Rivera",
  date: "Oct 31",
  priority: "Medium",
  tags: "Manual, Task",
  stage: "todo"
};

const initialColumns = [
  {
    id: "todo",
    title: "To Do",
    tone: "neutral",
    tasks: [
      { title: "Analyze meeting transcripts", owner: "Aisha Hassan", date: "Oct 24", priority: "High", tags: ["AI", "Meeting"], ai: true },
      { title: "Update project roadmap", owner: "Jordan Diaz", date: "Oct 26", priority: "Medium", tags: ["Roadmap", "Planning"] },
      { title: "Prepare Q4 risk register", owner: "Nora Kim", date: "Oct 27", priority: "High", tags: ["Risk", "Ops"] },
      { title: "Collect sprint feedback", owner: "Maya Stone", date: "Oct 28", priority: "Low", tags: ["Team", "Survey"] }
    ]
  },
  {
    id: "progress",
    title: "In Progress",
    tone: "blue",
    tasks: [
      { title: "AI Insight Generation", owner: "Alex Rivera", date: "Today", priority: "High", tags: ["Insight", "Source"], active: true, ai: true, comments: true },
      { title: "Employee feedback loop", owner: "Omar Reed", date: "Tomorrow", priority: "Medium", tags: ["People", "Process"] }
    ]
  },
  {
    id: "review",
    title: "Review",
    tone: "purple",
    tasks: [
      { title: "Resource allocation Q4", owner: "Aseel Rahman", date: "Oct 30", priority: "Medium", tags: ["Finance", "Approval"], description: "Requires manager approval for the new headcount in the Engineering team." }
    ]
  },
  {
    id: "done",
    title: "Done",
    tone: "green",
    done: true,
    tasks: [
      { title: "Draft AI usage policy", owner: "Sophia Chen", date: "Finished", priority: "Low", tags: ["Policy", "AI"] },
      { title: "Publish release checklist", owner: "Liam Carter", date: "Finished", priority: "Low", tags: ["Release", "QA"] },
      { title: "Sync stakeholder notes", owner: "Ethan Brooks", date: "Finished", priority: "Medium", tags: ["Notes", "Client"] },
      { title: "Close onboarding tickets", owner: "Noah Patel", date: "Finished", priority: "Low", tags: ["Support"] },
      { title: "Archive sprint demo files", owner: "Fatima Ali", date: "Finished", priority: "Low", tags: ["Files"] },
      { title: "Approve UI color tokens", owner: "Mira Lee", date: "Finished", priority: "Medium", tags: ["Design"] },
      { title: "Validate meeting summary QA", owner: "Daniel Park", date: "Finished", priority: "Low", tags: ["AI", "QA"] }
    ]
  }
];

export default function TasksPage() {
  const { normalizedRole } = useAuth();
  const [columns, setColumns] = useState(initialColumns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState(emptyTask);
  const [viewMode, setViewMode] = useState("board");
  const isMember = normalizedRole === "company_member";

  const totalTasks = useMemo(
    () => columns.reduce((total, column) => total + column.tasks.length, 0),
    [columns]
  );

  const taskRows = useMemo(
    () => columns.flatMap((column) => column.tasks.map((task, index) => ({
      ...task,
      rowId: `${column.id}-${task.title}-${task.date}-${index}`,
      stage: column.title,
      stageTone: column.tone,
      done: column.done
    }))),
    [columns]
  );

  function updateDraft(field, value) {
    setTaskDraft((current) => ({ ...current, [field]: value }));
  }

  function closeModal() {
    setIsModalOpen(false);
    setTaskDraft(emptyTask);
  }

  function createTask(event) {
    event.preventDefault();
    const title = taskDraft.title.trim();
    if (!title) return;

    const newTask = {
      title,
      owner: taskDraft.owner.trim() || "Olivia Rhye",
      date: taskDraft.date.trim() || "Oct 31",
      priority: taskDraft.priority,
      tags: taskDraft.tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 3)
    };

    setColumns((current) => current.map((column, index) => (
      column.id === taskDraft.stage || (!taskDraft.stage && index === 0)
        ? { ...column, tasks: [newTask, ...column.tasks] }
        : column
    )));
    closeModal();
  }

  return (
    <AppShell active={isMember ? "My Tasks" : "Tasks"} user="Alex Rivera" role="Lead Product Manager">
      <div className="tasks-workspace">
        <div className="tasks-page-head">
          <div>
            <h1>Project Tasks</h1>
            <p>Manage and track Q4 Strategic AI Initiatives</p>
          </div>
          <div className="tasks-head-actions">
            <div className="tasks-view-toggle" aria-label="Task view">
              <button className={viewMode === "board" ? "active" : ""} type="button" onClick={() => setViewMode("board")} aria-pressed={viewMode === "board"}><FiGrid aria-hidden="true" />Board</button>
              <button className={viewMode === "list" ? "active" : ""} type="button" onClick={() => setViewMode("list")} aria-pressed={viewMode === "list"}><FiList aria-hidden="true" />List</button>
            </div>
            {isMember ? null : (
              <button className="tasks-primary-button" type="button" onClick={() => setIsModalOpen(true)}>
                <FiPlus aria-hidden="true" />New Task
              </button>
            )}
          </div>
        </div>

        <div className="tasks-filter-bar">
          <button type="button"><FiFilter aria-hidden="true" />Priority<FiChevronDown aria-hidden="true" /></button>
          <button type="button"><FiUser aria-hidden="true" />Assignee<FiChevronDown aria-hidden="true" /></button>
          <button type="button"><FiCalendar aria-hidden="true" />Due Date<FiChevronDown aria-hidden="true" /></button>
          <span>{totalTasks} tasks in total</span>
        </div>

        {viewMode === "board" ? (
          <section className="tasks-kanban-board">
            {columns.map((column) => (
              <div className={`tasks-kanban-column tasks-kanban-column--${column.tone}`} key={column.title}>
                <div className="tasks-kanban-head">
                  <div>
                    <i aria-hidden="true" />
                    <h2>{column.title}</h2>
                    <span>{column.tasks.length}</span>
                  </div>
                  <button type="button" aria-label={`More actions for ${column.title}`}><FiMoreHorizontal aria-hidden="true" /></button>
                </div>
                <div className="tasks-kanban-list">
                  {column.tasks.map((task, index) => (
                    <TaskCard task={task} done={column.done} key={`${task.title}-${task.date}-${index}`} />
                  ))}
                  {!column.done ? (
                    <button className="tasks-add-card" type="button" onClick={() => {
                      updateDraft("stage", column.id);
                      setIsModalOpen(true);
                    }}>
                      <FiPlus aria-hidden="true" />Add Task
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </section>
        ) : (
          <section className="tasks-list-view" aria-label="Task list">
            <div className="tasks-list-head" aria-hidden="true">
              <span>Task</span>
              <span>Stage</span>
              <span>Owner</span>
              <span>Due</span>
              <span>Priority</span>
            </div>
            <div className="tasks-list-rows">
              {taskRows.map((task) => (
                <article className={`tasks-list-row ${task.done ? "is-done" : ""}`} key={task.rowId}>
                  <div className="tasks-list-main">
                    <span className={`tasks-stage-dot tasks-stage-dot--${task.stageTone}`} aria-hidden="true" />
                    <div>
                      <h3>{task.title}</h3>
                      {task.description ? <p>{task.description}</p> : null}
                      <div className="tasks-tag-row">
                        {task.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                    </div>
                  </div>
                  <span className="tasks-list-stage">{task.stage}</span>
                  <span className="tasks-list-owner"><i>{initials(task.owner)}</i>{task.owner}</span>
                  <span className="tasks-date"><FiCalendar aria-hidden="true" />{task.date}</span>
                  <span className={`tasks-priority tasks-priority--${task.priority.toLowerCase()}`}>{task.priority}</span>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="task-modal" onSubmit={createTask}>
            <div className="modal-head">
              <div>
                <span className="page-kicker">Create task</span>
                <h2>New Task</h2>
              </div>
              <button className="modal-close" type="button" onClick={closeModal} aria-label="Close">x</button>
            </div>

            <label>
              <span>Task title</span>
              <input
                autoFocus
                placeholder="Example: Review AI chat source citations"
                value={taskDraft.title}
                onChange={(event) => updateDraft("title", event.target.value)}
              />
            </label>

            <div className="modal-grid">
              <label>
                <span>Owner</span>
                <input value={taskDraft.owner} onChange={(event) => updateDraft("owner", event.target.value)} />
              </label>
              <label>
                <span>Due date</span>
                <input value={taskDraft.date} onChange={(event) => updateDraft("date", event.target.value)} />
              </label>
            </div>

            <div className="modal-grid">
              <label>
                <span>Stage</span>
                <select value={taskDraft.stage} onChange={(event) => updateDraft("stage", event.target.value)}>
                  {columns.map((column) => <option value={column.id} key={column.id}>{column.title}</option>)}
                </select>
              </label>
              <label>
                <span>Priority</span>
                <select value={taskDraft.priority} onChange={(event) => updateDraft("priority", event.target.value)}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
            </div>

            <div className="modal-grid modal-grid--single">
              <label>
                <span>Tags</span>
                <input value={taskDraft.tags} onChange={(event) => updateDraft("tags", event.target.value)} />
              </label>
            </div>

            <div className="modal-actions">
              <button className="filter-button" type="button" onClick={closeModal}>Cancel</button>
              <button className="product-button" type="submit">Create Task</button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}

function TaskCard({ task, done = false }) {
  return (
    <article className={`tasks-card ${task.active ? "tasks-card--active" : ""} ${done ? "tasks-card--done" : ""}`}>
      <div className="tasks-card-top">
        <span className={`tasks-priority tasks-priority--${task.priority.toLowerCase()}`}>{task.priority}</span>
        <div>
          {task.ai ? <FiZap aria-hidden="true" /> : null}
          {task.comments ? <span className="tasks-comment-dot" aria-hidden="true" /> : null}
        </div>
      </div>
      <h3>{task.title}</h3>
      {task.description ? <p>{task.description}</p> : null}
      <div className="tasks-card-bottom">
        <div className="tasks-assignee">
          <span>{initials(task.owner)}</span>
        </div>
        <div className="tasks-date">
          <FiCalendar aria-hidden="true" />
          <span>{task.date}</span>
        </div>
      </div>
      <div className="tasks-tag-row">
        {task.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
    </article>
  );
}

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2);
}
