export function taskStatusOptions() {
  return ["todo", "in_progress", "on_hold", "blocked", "review", "done"];
}

export function taskPriorityOptions() {
  return ["low", "medium", "high", "emergency"];
}

export function taskStatusKey(value = "") {
  const normalized = String(value).toLowerCase().replace(/[\s-]+/g, "_");
  return taskStatusOptions().includes(normalized) ? normalized : "todo";
}

export function taskPriorityKey(value = "") {
  const normalized = String(value).toLowerCase().replace(/[\s-]+/g, "_");
  return taskPriorityOptions().includes(normalized) ? normalized : "medium";
}

export function localizedTaskStatus(copy, status) {
  if (status === "todo") return copy.todo;
  if (status === "in_progress") return copy.inProgress;
  if (status === "done") return copy.done;
  if (status === "on_hold") return "On hold";
  if (status === "review") return "Review";
  return copy[status] || status;
}

export function localizedTaskPriority(copy, priority) {
  if (priority === "emergency") return "Emergency";
  return copy[priority] || priority;
}

export function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}
