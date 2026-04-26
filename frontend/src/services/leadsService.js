import { apiClient } from "./apiClient";

const BASE = "/leads/";

export const leadsService = {
  list:    ()           => apiClient.get(BASE),
  create:  (data)       => apiClient.post(BASE, data),
  update:  (id, data)   => apiClient.patch(`${BASE}${id}/`, data),
  destroy: (id)         => apiClient.delete(`${BASE}${id}/`),
  metrics: ()           => apiClient.get(`${BASE}metrics/`),
};
