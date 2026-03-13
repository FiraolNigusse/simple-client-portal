import { apiClient } from "./apiClient";

export const getClients = () => apiClient.get("/clients/");
export const createClient = (data) => apiClient.post("/clients/", data);
export const deleteClient = (id) => apiClient.delete(`/clients/${id}/`);
export const updateClient = (id, data) => apiClient.patch(`/clients/${id}/`, data);

export const getProjects = () => apiClient.get("/projects/");
export const createProject = (data) => apiClient.post("/projects/", data);
export const getProjectDetails = (id) => apiClient.get(`/projects/${id}/`);

export const getInvoices = () => apiClient.get("/invoices/");
export const createInvoice = (data) => apiClient.post("/invoices/", data);

export const getDashboardSummary = () => apiClient.get("/dashboard/summary/");

export default {
  getClients,
  createClient,
  deleteClient,
  updateClient,
  getProjects,
  createProject,
  getProjectDetails,
  getInvoices,
  createInvoice,
  getDashboardSummary,
};
