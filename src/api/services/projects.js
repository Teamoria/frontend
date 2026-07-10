import { apiRequest } from "../http.js";
import { normalizeCompanyProjectBody } from "../normalizers.js";

function projectBasePath(scope = "company") {
  return scope === "admin" ? "/admin/projects" : "/company/projects";
}

export function listProjects(scope, { page, archived } = {}) {
  return apiRequest(projectBasePath(scope), {
    auth: true,
    query: { page, archived: archived ? "1" : undefined }
  });
}

export function getProject(scope, id) {
  return apiRequest(`${projectBasePath(scope)}/${id}`, { auth: true });
}

export function createProject(scope, body) {
  const requestBody = scope === "admin" ? body : normalizeCompanyProjectBody(body);
  return apiRequest(projectBasePath(scope), {
    method: "POST",
    auth: true,
    body: requestBody
  });
}

export function updateProject(scope, id, body) {
  const requestBody = scope === "admin" ? body : normalizeCompanyProjectBody(body);
  return apiRequest(`${projectBasePath(scope)}/${id}`, {
    method: "PUT",
    auth: true,
    body: requestBody
  });
}

export function deleteProject(scope, id) {
  return apiRequest(`${projectBasePath(scope)}/${id}`, { method: "DELETE", auth: true });
}

export function restoreProject(scope, id) {
  return apiRequest(`${projectBasePath(scope)}/${id}/restore`, { method: "PATCH", auth: true });
}

export function forceDeleteProject(scope, id) {
  return apiRequest(`${projectBasePath(scope)}/${id}/force-delete`, { method: "DELETE", auth: true });
}

export function addProjectMembers(scope, id, body) {
  return apiRequest(`${projectBasePath(scope)}/${id}/members`, { method: "POST", auth: true, body });
}

export function removeProjectMember(scope, id, userId) {
  return apiRequest(`${projectBasePath(scope)}/${id}/members/${userId}`, { method: "DELETE", auth: true });
}

export const listAdminProjects = (options) => listProjects("admin", options);
export const getAdminProject = (id) => getProject("admin", id);
export const createAdminProject = (body) => createProject("admin", body);
export const updateAdminProject = (id, body) => updateProject("admin", id, body);
export const deleteAdminProject = (id) => deleteProject("admin", id);
export const restoreAdminProject = (id) => restoreProject("admin", id);
export const forceDeleteAdminProject = (id) => forceDeleteProject("admin", id);
export const addAdminProjectMembers = (id, body) => addProjectMembers("admin", id, body);
export const removeAdminProjectMember = (id, userId) => removeProjectMember("admin", id, userId);

export const listCompanyProjects = (options) => listProjects("company", options);
export const getCompanyProject = (id) => getProject("company", id);
export const createCompanyProject = (body) => createProject("company", body);
export const updateCompanyProject = (id, body) => updateProject("company", id, body);
export const deleteCompanyProject = (id) => deleteProject("company", id);
export const restoreCompanyProject = (id) => restoreProject("company", id);
export const forceDeleteCompanyProject = (id) => forceDeleteProject("company", id);
export const addCompanyProjectMembers = (id, body) => addProjectMembers("company", id, body);
export const removeCompanyProjectMember = (id, userId) => removeProjectMember("company", id, userId);
