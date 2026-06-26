import { useMemo, useState } from "react";
import AppShell from "../components/app/AppShell.jsx";
import { kanbanColumns } from "../data/teamoriaData.js";

const emptyTask = {
  title: "",
  owner: "Olivia Rhye",
  date: "Jun 30, 2026",
  priority: "Medium",
  tags: "Manual, Task"
};

export default function TasksPage() {
  const [columns, setColumns] = useState(kanbanColumns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState(emptyTask);

  const totalTasks = useMemo(
    () => columns.reduce((total, column) => total + column.tasks.length, 0),
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
      date: taskDraft.date.trim() || "Jun 30, 2026",
      priority: taskDraft.priority,
      tags: taskDraft.tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 3)
    };

    setColumns((current) => current.map((column, index) => (
      index === 0
        ? { ...column, count: column.count + 1, tasks: [newTask, ...column.tasks] }
        : column
    )));
    closeModal();
  }

  return (
    <AppShell active="Kanban Board" user="Fares Namlah" role="Manager" roleId="manager">
      <div className="task-board-toolbar">
        <div>
          <span className="page-kicker">Delivery board</span>
          <h1>Task Hub</h1>
          <p>Organize {totalTasks} tasks, review AI-extracted work, and move execution forward.</p>
        </div>
        <div className="view-switch">
          <button className="active" type="button">Board</button>
          <button type="button">List</button>
          <button type="button">Calendar</button>
        </div>
        <button className="filter-button task-filter-button" type="button">Filter</button>
        <button className="product-button" type="button" onClick={() => setIsModalOpen(true)}>New Task</button>
      </div>

      <section className="kanban-board-modern">
        {columns.map((column) => (
          <div className="kanban-column" key={column.title}>
            <div className="kanban-head">
              <h2>{column.title} <span>{column.tasks.length}</span></h2>
              <button className="column-menu-button" type="button" aria-label={`More actions for ${column.title}`}>...</button>
            </div>
            {column.tasks.map((task, index) => (
              <article className={`kanban-task ${task.active ? "active" : ""} ${column.done ? "done" : ""}`} key={`${task.title}-${task.date}-${index}`}>
                <h3>{task.title}</h3>
                <div className="task-owner">
                  <span className="mini-avatar">{initials(task.owner)}</span>
                  <span>{task.owner}</span>
                  <em className={`priority priority--${task.priority}`}><i />{task.priority}</em>
                </div>
                <span className={`task-date ${index === 0 && column.title === "Open" ? "overdue" : ""}`}>CAL Due {task.date}</span>
                <div className="task-tags">
                  {task.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className="task-card-meta">
                  <span>ATT {index + 1}</span>
                  <span>COM {2 + index}</span>
                  <span>SUB {Math.min(index + 1, 3)}/3</span>
                </div>
              </article>
            ))}
            <button className="add-task-link add-task-button" type="button" onClick={() => setIsModalOpen(true)}>Add Task</button>
          </div>
        ))}
      </section>

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
                <span>Priority</span>
                <select value={taskDraft.priority} onChange={(event) => updateDraft("priority", event.target.value)}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
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

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2);
}
