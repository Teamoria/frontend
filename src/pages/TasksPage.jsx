import { useEffect, useMemo, useState } from "react";
import AppShell, { AppPageLayout } from "../components/app/AppShell.jsx";
import {
  FiCalendar,
  FiEdit2,
  FiFilter,
  FiGrid,
  FiList,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUser,
  FiX,
  FiZap
} from "react-icons/fi";
import {
  addTaskAssignees,
  addTaskDependencies,
  addTaskNote,
  createTask,
  deleteTask,
  deleteTaskNote,
  getPayloadData,
  listAdminProjects,
  listCompanyProjects,
  listStaff,
  listTasks,
  listUsers,
  removeTaskAssignee,
  removeTaskDependency,
  updateTask
} from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import "../styles/tasks.css";

const statusColumns = [
  { id: "todo", title: "To Do", tone: "neutral" },
  { id: "in_progress", title: "In Progress", tone: "blue" },
  { id: "on_hold", title: "On Hold", tone: "purple" },
  { id: "blocked", title: "Blocked", tone: "purple" },
  { id: "review", title: "Review", tone: "blue" },
  { id: "done", title: "Done", tone: "green", done: true }
];

const priorityOptions = ["low", "medium", "high", "emergency"];
const emptyTask = {
  project_id: "",
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  due_date: "",
  assignee_ids: [],
  dependency_ids: []
};

export default function TasksPage() {
  const { normalizedRole, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [people, setPeople] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0, has_more: false });
  const [filters, setFilters] = useState({
    project_id: "",
    status: "",
    priority: "",
    assignee_id: "",
    due_from: "",
    due_to: "",
    archived: false,
    per_page: 10
  });
  const [taskDraft, setTaskDraft] = useState(emptyTask);
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailDraft, setDetailDraft] = useState({ assignee_id: "", dependency_id: "", note: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("board");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isMember = normalizedRole === "company_member";
  const isAdmin = normalizedRole === "admin";

  useEffect(() => {
    loadReferenceData();
  }, [normalizedRole]);

  useEffect(() => {
    loadTasks();
  }, [normalizedRole, filters.project_id, filters.status, filters.priority, filters.assignee_id, filters.due_from, filters.due_to, filters.archived, filters.per_page]);

  const columns = useMemo(() => {
    return statusColumns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.status === column.id)
    }));
  }, [tasks]);

  const taskRows = useMemo(() => tasks.map((task) => ({
    ...task,
    stage: formatLabel(task.status),
    stageTone: statusColumns.find((column) => column.id === task.status)?.tone || "neutral",
    done: task.status === "done"
  })), [tasks]);

  async function loadReferenceData() {
    if (isMember) {
      setProjects([]);
      setPeople([]);
      return;
    }

    try {
      const [projectsPayload, peoplePayload] = await Promise.all([
        isAdmin ? listAdminProjects() : listCompanyProjects(),
        isAdmin ? listUsers({ page: 1 }) : listStaff({ page: 1 })
      ]);

      setProjects(extractRows(getPayloadData(projectsPayload), ["projects"]).map(normalizeProject).filter((project) => project.id && project.isValidUuid));
      setPeople(extractRows(getPayloadData(peoplePayload), ["users", "staff"]).map(normalizePerson).filter((person) => person.id));
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function loadTasks() {
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = await listTasks({
        role: normalizedRole,
        project_id: filters.project_id,
        "statuses[]": filters.status ? [filters.status] : undefined,
        "priorities[]": filters.priority ? [filters.priority] : undefined,
        assignee_id: filters.assignee_id,
        due_from: filters.due_from,
        due_to: filters.due_to,
        archived: filters.archived ? "1" : undefined,
        per_page: filters.per_page
      });
      const data = getPayloadData(payload);
      const rows = extractRows(data, ["tasks"]);
      setTasks(rows.map(normalizeTask));
      setPagination(data?.pagination || payload?.pagination || { current_page: 1, last_page: 1, per_page: filters.per_page, total: rows.length, has_more: false });
    } catch (error) {
      setTasks([]);
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  function updateDraft(field, value) {
    setTaskDraft((current) => {
      if (field === "project_id") {
        return { ...current, project_id: value, assignee_ids: [], dependency_ids: [] };
      }

      return { ...current, [field]: value };
    });
  }

  function toggleDraftArray(field, id) {
    setTaskDraft((current) => ({
      ...current,
      [field]: current[field].includes(id) ? current[field].filter((item) => item !== id) : [...current[field], id]
    }));
  }

  function closeModal() {
    setIsModalOpen(false);
    setTaskDraft(emptyTask);
    setIsSaving(false);
  }

  async function submitTask(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!taskDraft.project_id) {
      setStatus({ type: "error", message: "Choose a project before creating a task." });
      return;
    }

    if (!isUuid(taskDraft.project_id)) {
      setStatus({ type: "error", message: "Choose a real backend project. The selected project id is not a valid UUID." });
      return;
    }

    setIsSaving(true);

    try {
      await createTask(taskDraft, { role: normalizedRole });
      setStatus({ type: "success", message: "Task created successfully." });
      closeModal();
      await loadTasks();
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSaving(false);
    }
  }

  async function changeTaskStatus(task, nextStatus) {
    if (task.status === nextStatus) return;
    const previousTasks = tasks;
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item));

    try {
      await updateTask(task.id, { status: nextStatus }, { role: normalizedRole });
      setStatus({ type: "success", message: "Task status updated." });
    } catch (error) {
      setTasks(previousTasks);
      setStatus({ type: "error", message: error.message });
    }
  }

  async function archiveTask(task) {
    if (!window.confirm(`Archive ${task.title}?`)) return;

    try {
      await deleteTask(task.id, { role: normalizedRole });
      setStatus({ type: "success", message: "Task archived successfully." });
      setSelectedTask(null);
      await loadTasks();
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function saveTaskChanges(draft) {
    if (!selectedTask) return;
    setStatus({ type: "", message: "" });

    if (!draft.project_id) {
      setStatus({ type: "error", message: "Choose a project before updating the task." });
      return;
    }

    if (!isUuid(draft.project_id)) {
      setStatus({ type: "error", message: "Choose a real backend project. The selected project id is not a valid UUID." });
      return;
    }

    setIsSaving(true);

    try {
      const payload = await updateTask(selectedTask.id, draft, { role: normalizedRole });
      const data = getPayloadData(payload);
      const updatedTask = data?.task || data;
      if (updatedTask?.id) {
        setSelectedTask(normalizeTask(updatedTask));
      } else {
        const project = projects.find((item) => item.id === draft.project_id);
        setSelectedTask((current) => ({
          ...current,
          ...draft,
          projectId: draft.project_id,
          projectName: project?.name || current.projectName,
          assignees: people.filter((person) => draft.assignee_ids.includes(person.id)),
          dependencies: tasks.filter((task) => draft.dependency_ids.includes(task.id)).map((task) => ({ id: task.id, title: task.title }))
        }));
      }
      setStatus({ type: "success", message: "Task updated successfully." });
      await loadTasks();
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSaving(false);
    }
  }

  async function runDetailAction(action, message) {
    if (!selectedTask) return;
    setIsSaving(true);

    try {
      await action();
      setStatus({ type: "success", message });
      setDetailDraft({ assignee_id: "", dependency_id: "", note: "" });
      await loadTasks();
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell active={isMember ? "My Tasks" : "Tasks"} user={user?.name || "Teamoria User"} role={formatLabel(normalizedRole || "Company User")}>
      <AppPageLayout
        className="tasks-workspace"
        title="Project Tasks"
        subtitle={`Live task board connected to the ${isAdmin ? "admin" : "company"} tasks API.`}
        actions={(
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
        )}
      >

        {status.message ? <p className={`auth-alert auth-alert--${status.type}`} role="alert">{status.message}</p> : null}

        <TaskFilters
          filters={filters}
          onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
          onRefresh={loadTasks}
          people={people}
          projects={projects}
          total={pagination.total || tasks.length}
        />

        {viewMode === "board" ? (
          <section className="tasks-kanban-board">
            {columns.map((column) => (
              <div className={`tasks-kanban-column tasks-kanban-column--${column.tone}`} key={column.id}>
                <div className="tasks-kanban-head">
                  <div>
                    <i aria-hidden="true" />
                    <h2>{column.title}</h2>
                    <span>{column.tasks.length}</span>
                  </div>
                </div>
                <div className="tasks-kanban-list">
                  {isLoading ? <p className="tasks-empty-state">Loading tasks...</p> : null}
                  {!isLoading && column.tasks.length === 0 ? <p className="tasks-empty-state">No tasks.</p> : null}
                  {column.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      onOpen={() => setSelectedTask(task)}
                      onStatusChange={(nextStatus) => changeTaskStatus(task, nextStatus)}
                      task={task}
                    />
                  ))}
                  {!isMember && column.id !== "done" ? (
                    <button className="tasks-add-card" type="button" onClick={() => {
                      updateDraft("status", column.id);
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
              {isLoading ? <p className="tasks-empty-state">Loading tasks...</p> : null}
              {!isLoading && taskRows.length === 0 ? <p className="tasks-empty-state">No tasks found.</p> : null}
              {taskRows.map((task) => (
                <article className={`tasks-list-row ${task.done ? "is-done" : ""}`} key={task.id} onClick={() => setSelectedTask(task)}>
                  <div className="tasks-list-main">
                    <span className={`tasks-stage-dot tasks-stage-dot--${task.stageTone}`} aria-hidden="true" />
                    <div>
                      <h3>{task.title}</h3>
                      {task.description ? <p>{task.description}</p> : null}
                      <div className="tasks-tag-row">
                        <span>{task.projectName || "No project"}</span>
                        <span>{task.assigneeLabel}</span>
                      </div>
                    </div>
                  </div>
                  <span className="tasks-list-stage">{task.stage}</span>
                  <span className="tasks-list-owner"><i>{initials(task.assigneeLabel)}</i>{task.assigneeLabel}</span>
                  <span className="tasks-date"><FiCalendar aria-hidden="true" />{formatDate(task.due_date)}</span>
                  <span className={`tasks-priority tasks-priority--${getPriorityClass(task.priority)}`}>{formatLabel(task.priority)}</span>
                </article>
              ))}
            </div>
          </section>
        )}
      </AppPageLayout>

      {isModalOpen ? (
        <CreateTaskModal
          draft={taskDraft}
          isSaving={isSaving}
          onClose={closeModal}
          onSubmit={submitTask}
          onToggleArray={toggleDraftArray}
          onUpdate={updateDraft}
          people={people}
          projects={projects}
          tasks={tasks}
        />
      ) : null}

      {selectedTask ? (
        <TaskDetailsModal
          detailDraft={detailDraft}
          isSaving={isSaving}
          onArchive={() => archiveTask(selectedTask)}
          onClose={() => setSelectedTask(null)}
          onRemoveAssignee={(userId) => runDetailAction(() => removeTaskAssignee(selectedTask.id, userId, { role: normalizedRole }), "Assignee removed.")}
          onRemoveDependency={(dependencyId) => runDetailAction(() => removeTaskDependency(selectedTask.id, dependencyId, { role: normalizedRole }), "Dependency removed.")}
          onRemoveNote={(noteId) => runDetailAction(() => deleteTaskNote(selectedTask.id, noteId, { role: normalizedRole }), "Note deleted.")}
          onRunAction={runDetailAction}
          onSaveTask={saveTaskChanges}
          onUpdateDraft={(field, value) => setDetailDraft((current) => ({ ...current, [field]: value }))}
          people={people}
          projects={projects}
          role={normalizedRole}
          task={selectedTask}
          tasks={tasks}
        />
      ) : null}
    </AppShell>
  );
}

function TaskFilters({ filters, onChange, onRefresh, people, projects, total }) {
  return (
    <div className="tasks-filter-bar tasks-filter-bar--form">
      <label>
        <span>Project</span>
          <select value={filters.project_id} onChange={(event) => onChange("project_id", event.target.value)}>
            <option value="">All projects</option>
            {projects.length === 0 ? <option value="" disabled>No UUID projects loaded</option> : null}
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
      </label>
      <label>
        <span>Status</span>
        <select value={filters.status} onChange={(event) => onChange("status", event.target.value)}>
          <option value="">All statuses</option>
          {statusColumns.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select value={filters.priority} onChange={(event) => onChange("priority", event.target.value)}>
          <option value="">All priorities</option>
          {priorityOptions.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
        </select>
      </label>
      <label>
        <span>Assignee</span>
        <select value={filters.assignee_id} onChange={(event) => onChange("assignee_id", event.target.value)}>
          <option value="">Any assignee</option>
          {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
        </select>
      </label>
      <label>
        <span>Due from</span>
        <input type="date" value={filters.due_from} onChange={(event) => onChange("due_from", event.target.value)} />
      </label>
      <label>
        <span>Due to</span>
        <input type="date" value={filters.due_to} onChange={(event) => onChange("due_to", event.target.value)} />
      </label>
      <label>
        <span>Per page</span>
        <select value={filters.per_page} onChange={(event) => onChange("per_page", event.target.value)}>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </label>
      <label className="tasks-check-filter">
        <input checked={filters.archived} type="checkbox" onChange={(event) => onChange("archived", event.target.checked)} />
        <span>Archived</span>
      </label>
      <button type="button" onClick={onRefresh}><FiRefreshCw aria-hidden="true" />Refresh</button>
      <span>{total} tasks in total</span>
    </div>
  );
}

function CreateTaskModal({ draft, isSaving, onClose, onSubmit, onToggleArray, onUpdate, people, projects, tasks }) {
  const selectedProject = projects.find((project) => project.id === draft.project_id);
  const availableAssignees = selectedProject
    ? people.filter((person) => selectedProject.memberIds.includes(person.id))
    : [];
  const availableDependencies = draft.project_id
    ? tasks.filter((task) => task.id && task.projectId === draft.project_id)
    : [];

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="task-modal" onSubmit={onSubmit}>
        <div className="modal-head">
          <div>
            <span className="page-kicker">Create task</span>
            <h2>New Task</h2>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close">x</button>
        </div>

        <label>
          <span>Project</span>
          <select required value={draft.project_id} onChange={(event) => onUpdate("project_id", event.target.value)}>
            <option value="">Choose project</option>
            {projects.length === 0 ? <option value="" disabled>No UUID projects loaded</option> : null}
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>
        <label>
          <span>Task title</span>
          <input autoFocus required placeholder="Example: Review AI chat source citations" value={draft.title} onChange={(event) => onUpdate("title", event.target.value)} />
        </label>
        <label>
          <span>Description</span>
          <textarea rows="3" value={draft.description} onChange={(event) => onUpdate("description", event.target.value)} />
        </label>

        <div className="modal-grid">
          <label>
            <span>Status</span>
            <select value={draft.status} onChange={(event) => onUpdate("status", event.target.value)}>
              {statusColumns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}
            </select>
          </label>
          <label>
            <span>Priority</span>
            <select value={draft.priority} onChange={(event) => onUpdate("priority", event.target.value)}>
              {priorityOptions.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
            </select>
          </label>
        </div>
        <label>
          <span>Due date</span>
          <input type="date" value={draft.due_date} onChange={(event) => onUpdate("due_date", event.target.value)} />
        </label>

        <SelectionGrid
          emptyText={draft.project_id ? "No members are assigned to this project." : "Choose a project first."}
          label="Assignees"
          items={availableAssignees}
          selectedIds={draft.assignee_ids}
          onToggle={(id) => onToggleArray("assignee_ids", id)}
        />
        <SelectionGrid
          emptyText={draft.project_id ? "No tasks are available in this project." : "Choose a project first."}
          label="Dependencies"
          items={availableDependencies}
          selectedIds={draft.dependency_ids}
          onToggle={(id) => onToggleArray("dependency_ids", id)}
        />

        <div className="modal-actions">
          <button className="filter-button" type="button" onClick={onClose}>Cancel</button>
          <button className="product-button" disabled={isSaving} type="submit">{isSaving ? "Creating..." : "Create Task"}</button>
        </div>
      </form>
    </div>
  );
}

function TaskDetailsModal({
  detailDraft,
  isSaving,
  onArchive,
  onClose,
  onRemoveAssignee,
  onRemoveDependency,
  onRemoveNote,
  onRunAction,
  onSaveTask,
  onUpdateDraft,
  people,
  projects,
  role,
  task,
  tasks
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(() => createTaskEditDraft(task));
  const taskProject = projects.find((project) => project.id === task.projectId);
  const editProject = projects.find((project) => project.id === editDraft.project_id);
  const availablePeople = taskProject ? people.filter((person) => taskProject.memberIds.includes(person.id)) : [];
  const availableEditPeople = editProject ? people.filter((person) => editProject.memberIds.includes(person.id)) : [];
  const availableDependencies = tasks.filter((item) => item.id && item.id !== task.id && item.projectId === task.projectId);
  const availableEditDependencies = tasks.filter((item) => item.id && item.id !== task.id && item.projectId === editDraft.project_id);

  useEffect(() => {
    setIsEditing(false);
    setEditDraft(createTaskEditDraft(task));
  }, [task.id]);

  function updateEditDraft(field, value) {
    setEditDraft((current) => {
      if (field === "project_id") {
        return { ...current, project_id: value, assignee_ids: [], dependency_ids: [] };
      }

      return { ...current, [field]: value };
    });
  }

  function toggleEditArray(field, id) {
    setEditDraft((current) => ({
      ...current,
      [field]: current[field].includes(id) ? current[field].filter((item) => item !== id) : [...current[field], id]
    }));
  }

  async function submitEdit(event) {
    event.preventDefault();
    await onSaveTask(editDraft);
    setIsEditing(false);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="task-modal task-details-modal" role="dialog" aria-modal="true" aria-labelledby="task-details-title">
        <div className="modal-head">
          <div>
            <span className="page-kicker">{isEditing ? "Edit task" : formatLabel(task.status)}</span>
            <h2 id="task-details-title">{isEditing ? "Update Task" : task.title}</h2>
          </div>
          <div className="task-modal-head-actions">
            {!isEditing ? (
              <button className="task-icon-button" type="button" onClick={() => setIsEditing(true)} aria-label="Edit task">
                <FiEdit2 aria-hidden="true" />
              </button>
            ) : null}
            <button className="modal-close" type="button" onClick={onClose} aria-label="Close">x</button>
          </div>
        </div>

        {isEditing ? (
          <form className="task-edit-form" onSubmit={submitEdit}>
            <label>
              <span>Project</span>
              <select required value={editDraft.project_id} onChange={(event) => updateEditDraft("project_id", event.target.value)}>
                <option value="">Choose project</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </label>
            <label>
              <span>Task title</span>
              <input required value={editDraft.title} onChange={(event) => updateEditDraft("title", event.target.value)} />
            </label>
            <label>
              <span>Description</span>
              <textarea rows="3" value={editDraft.description} onChange={(event) => updateEditDraft("description", event.target.value)} />
            </label>
            <div className="modal-grid">
              <label>
                <span>Status</span>
                <select value={editDraft.status} onChange={(event) => updateEditDraft("status", event.target.value)}>
                  {statusColumns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}
                </select>
              </label>
              <label>
                <span>Priority</span>
                <select value={editDraft.priority} onChange={(event) => updateEditDraft("priority", event.target.value)}>
                  {priorityOptions.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
                </select>
              </label>
            </div>
            <label>
              <span>Due date</span>
              <input type="date" value={editDraft.due_date} onChange={(event) => updateEditDraft("due_date", event.target.value)} />
            </label>
            <SelectionGrid
              emptyText={editDraft.project_id ? "No members are assigned to this project." : "Choose a project first."}
              label="Assignees"
              items={availableEditPeople}
              selectedIds={editDraft.assignee_ids}
              onToggle={(id) => toggleEditArray("assignee_ids", id)}
            />
            <SelectionGrid
              emptyText={editDraft.project_id ? "No tasks are available in this project." : "Choose a project first."}
              label="Dependencies"
              items={availableEditDependencies}
              selectedIds={editDraft.dependency_ids}
              onToggle={(id) => toggleEditArray("dependency_ids", id)}
            />
            <div className="modal-actions">
              <button className="filter-button" type="button" onClick={() => {
                setEditDraft(createTaskEditDraft(task));
                setIsEditing(false);
              }}>Cancel</button>
              <button className="product-button" disabled={isSaving} type="submit">{isSaving ? "Saving..." : "Save Changes"}</button>
            </div>
          </form>
        ) : (
          <>
            {task.description ? <p className="task-details-description">{task.description}</p> : null}

            <div className="task-details-meta" aria-label="Task information">
              <article>
                <span>Project</span>
                <b>{task.projectName || "No project"}</b>
              </article>
              <article>
                <span>Status</span>
                <b>{formatLabel(task.status)}</b>
              </article>
              <article>
                <span>Priority</span>
                <b>{formatLabel(task.priority)}</b>
              </article>
              <article>
                <span>Due date</span>
                <b>{formatDate(task.due_date)}</b>
              </article>
            </div>

            <TaskLinkedSection
              actionLabel="Add assignee"
              emptyText="No assignees yet."
              items={task.assignees}
              onAdd={() => onRunAction(() => addTaskAssignees(task.id, { user_ids: [detailDraft.assignee_id], assignee_ids: [detailDraft.assignee_id] }, { role }), "Assignee added.")}
              onRemove={(item) => onRemoveAssignee(item.id)}
              selectLabel="Assignee"
              selectValue={detailDraft.assignee_id}
              setSelectValue={(value) => onUpdateDraft("assignee_id", value)}
              options={availablePeople}
            />

            <TaskLinkedSection
              actionLabel="Add dependency"
              emptyText="No dependencies yet."
              items={task.dependencies}
              onAdd={() => onRunAction(() => addTaskDependencies(task.id, { dependency_ids: [detailDraft.dependency_id] }, { role }), "Dependency added.")}
              onRemove={(item) => onRemoveDependency(item.id)}
              selectLabel="Dependency"
              selectValue={detailDraft.dependency_id}
              setSelectValue={(value) => onUpdateDraft("dependency_id", value)}
              options={availableDependencies}
            />

            <section className="task-details-section">
              <h3>Notes</h3>
              <div className="task-note-form">
                <textarea rows="3" placeholder="Add a note..." value={detailDraft.note} onChange={(event) => onUpdateDraft("note", event.target.value)} />
                <button
                  className="product-button"
                  disabled={isSaving || !detailDraft.note.trim()}
                  type="button"
                  onClick={() => onRunAction(() => addTaskNote(task.id, { note: detailDraft.note, body: detailDraft.note, content: detailDraft.note }, { role }), "Note added.")}
                >
                  Add note
                </button>
              </div>
              <div className="task-linked-list">
                {task.notes.length ? task.notes.map((note) => (
                  <article key={note.id || note.text}>
                    <span>{note.text}</span>
                    {note.id ? <button type="button" onClick={() => onRemoveNote(note.id)}><FiTrash2 aria-hidden="true" /></button> : null}
                  </article>
                )) : <p>No notes yet.</p>}
              </div>
            </section>

            <div className="modal-actions">
              <button className="filter-button" type="button" onClick={onClose}>Close</button>
              <button className="tasks-danger-button" type="button" onClick={onArchive}><FiTrash2 aria-hidden="true" />Archive</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function TaskLinkedSection({ actionLabel, emptyText, items, onAdd, onRemove, options, selectLabel, selectValue, setSelectValue }) {
  return (
    <section className="task-details-section">
      <h3>{selectLabel}s</h3>
      <div className="task-link-form">
        <select value={selectValue} onChange={(event) => setSelectValue(event.target.value)}>
          <option value="">Choose {selectLabel.toLowerCase()}</option>
          {options.map((item) => <option key={item.id} value={item.id}>{item.name || item.title}</option>)}
        </select>
        <button className="product-button" disabled={!selectValue} type="button" onClick={onAdd}>{actionLabel}</button>
      </div>
      <div className="task-linked-list">
        {items.length ? items.map((item) => (
          <article key={item.id || item.name}>
            <span>{item.name || item.title || item.email}</span>
            {item.id ? <button type="button" onClick={() => onRemove(item)}><FiX aria-hidden="true" /></button> : null}
          </article>
        )) : <p>{emptyText}</p>}
      </div>
    </section>
  );
}

function SelectionGrid({ emptyText, items, label, onToggle, selectedIds }) {
  return (
    <fieldset className="tasks-selection-grid">
      <legend>{label}</legend>
      {items.length === 0 ? <p>{emptyText || `No ${label.toLowerCase()} available.`}</p> : items.map((item) => (
        <label key={item.id}>
          <input checked={selectedIds.includes(item.id)} type="checkbox" onChange={() => onToggle(item.id)} />
          <span>{item.name || item.title}</span>
        </label>
      ))}
    </fieldset>
  );
}

function TaskCard({ onOpen, task }) {
  return (
    <article
      className={`tasks-card tasks-card--title-only ${task.status === "in_progress" ? "tasks-card--active" : ""} ${task.status === "done" ? "tasks-card--done" : ""}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      aria-label={`Open task ${task.title}`}
    >
      <h3>{task.title}</h3>
    </article>
  );
}

function extractRows(data, keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function normalizeProject(project) {
  const id = String(project.id || project.uuid || "");
  const members = normalizeCollection(project.users || project.members || project.team).map(normalizePerson).filter((person) => person.id);

  return {
    id,
    isValidUuid: isUuid(id),
    memberIds: members.map((member) => member.id),
    members,
    name: project.name || project.title || "Untitled project"
  };
}

function normalizePerson(person) {
  const value = person.user || person;
  const name = value.name || value.full_name || value.email || "User";
  return { id: String(value.id || value.user_id || ""), name, email: value.email || "" };
}

function normalizeTask(task) {
  const assignees = normalizeCollection(task.assignees || task.users || task.assigned_users).map(normalizePerson);
  const dependencies = normalizeCollection(task.dependencies || task.dependency_tasks).map((item) => ({
    id: String(item.id || item.task_id || item.dependency_id || ""),
    title: item.title || item.name || item.task?.title || "Dependency"
  }));
  const notes = normalizeCollection(task.notes).map((item) => ({
    id: item.id || item.note_id,
    text: item.note || item.body || item.content || item.text || ""
  }));
  const projectName = task.project?.name || task.project_name || "";
  const projectId = String(task.project_id || task.project?.id || "");

  return {
    ...task,
    id: String(task.id || task.uuid || ""),
    title: task.title || "Untitled task",
    description: task.description || "",
    status: normalizeStatus(task.status),
    priority: normalizePriority(task.priority),
    due_date: task.due_date || task.due_at || "",
    projectId,
    projectName,
    assignees,
    dependencies,
    notes,
    assigneeLabel: assignees.length ? assignees.map((person) => person.name).join(", ") : "Unassigned"
  };
}

function normalizeCollection(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function createTaskEditDraft(task) {
  return {
    project_id: task.projectId || task.project_id || "",
    title: task.title || "",
    description: task.description || "",
    status: normalizeStatus(task.status),
    priority: normalizePriority(task.priority),
    due_date: normalizeDateInput(task.due_date),
    assignee_ids: normalizeCollection(task.assignees).map((person) => person.id).filter(Boolean),
    dependency_ids: normalizeCollection(task.dependencies).map((item) => item.id).filter(Boolean)
  };
}

function normalizeStatus(status) {
  const value = String(status || "todo").toLowerCase().replace(/\s+/g, "_");
  return statusColumns.some((column) => column.id === value) ? value : "todo";
}

function normalizePriority(priority) {
  const value = String(priority || "medium").toLowerCase();
  return priorityOptions.includes(value) ? value : "medium";
}

function getPriorityClass(priority) {
  return priority === "emergency" ? "high" : normalizePriority(priority);
}

function initials(name) {
  return String(name || "U").split(/\s|,/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
}

function formatLabel(value) {
  return String(value || "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function normalizeDateInput(value) {
  if (!value) return "";
  const dateText = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return dateText;
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}
