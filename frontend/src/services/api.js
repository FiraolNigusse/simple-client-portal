import { apiClient } from "./apiClient";
export { apiClient };

export const getClients = () => apiClient.get("/clients/");
export const createClient = (data) => apiClient.post("/clients/", data);
export const deleteClient = (id) => apiClient.delete(`/clients/${id}/`);
export const updateClient = (id, data) => apiClient.patch(`/clients/${id}/`, data);
export const getClientDetails = (id) => apiClient.get(`/clients/${id}/`);
export const generatePortal = (clientId) => apiClient.post("/clients/portal/generate/", { client_id: clientId });

export const getProjects = () => apiClient.get("/projects/");
export const createProject = (data) => apiClient.post("/projects/", data);
export const getProjectDetails = (id) => apiClient.get(`/projects/${id}/`);
export const updateProject = (id, data) => apiClient.patch(`/projects/${id}/`, data);

export const getTasks = (projectId) => apiClient.get(`/tasks/?project=${projectId}`);
export const createTask = (data) => apiClient.post("/tasks/", data);
export const updateTask = (id, data) => apiClient.patch(`/tasks/${id}/`, data);
export const deleteTask = (id) => apiClient.delete(`/tasks/${id}/`);

export const getProjectFiles = (projectId) => apiClient.get(`/files/project/${projectId}/`);
export const uploadFile = (data) => apiClient.post("/files/", data, {
  headers: { "Content-Type": "multipart/form-data" }
});

export const getInvoices = () => apiClient.get("/invoices/");
export const createInvoice = (data) => apiClient.post("/invoices/", data);

export const getDashboardSummary = () => apiClient.get("/dashboard/summary/");

export default {
  apiClient,
  getClients,
  createClient,
  deleteClient,
  updateClient,
  getClientDetails,
  generatePortal,
  getProjects,
  createProject,
  getProjectDetails,
  updateProject,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getProjectFiles,
  uploadFile,
  getInvoices,
  createInvoice,
  getDashboardSummary,
};
