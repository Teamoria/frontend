import AppShell from "../components/app/AppShell.jsx";
import { kanbanColumns } from "../data/teamoriaData.js";

export default function TasksPage() {
  return (
    <AppShell active="Tasks" user="Olivia Rhye" role="">
      <div className="task-board-toolbar">
        <div>
          <h1>Task Hub</h1>
          <p>Organize tasks, track progress, and get things done.</p>
        </div>
        <div className="view-switch">
          <button className="active" type="button">▦ Board</button>
          <button type="button">List</button>
          <button type="button">Calendar</button>
        </div>
        <label className="product-search">
          <span>Search</span>
          <input placeholder="Search tasks..." />
        </label>
        <button className="product-button" type="button">New Task</button>
      </div>

      <section className="kanban-board-modern">
        {kanbanColumns.map((column) => (
          <div className="kanban-column" key={column.title}>
            <div className="kanban-head">
              <h2>{column.done ? "Done" : "Stage"} {column.title} <span>{column.count}</span></h2>
              <button className="filter-button" type="button">More</button>
            </div>
            {column.tasks.map((task) => (
              <article className={`kanban-task ${task.active ? "active" : ""} ${column.done ? "done" : ""}`} key={task.title}>
                <h3>{task.title}</h3>
                <div className="task-owner">
                  <span className="mini-avatar">{initials(task.owner)}</span>
                  <span>{task.owner}</span>
                  <em className={`priority priority--${task.priority}`}>{task.priority}</em>
                </div>
                <span className="task-date">Due {task.date}</span>
                <div className="task-tags">
                  {task.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </article>
            ))}
            <a className="add-task-link" href="#/tasks">Add Task</a>
          </div>
        ))}
      </section>
    </AppShell>
  );
}

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2);
}
