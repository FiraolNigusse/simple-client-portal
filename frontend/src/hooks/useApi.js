import { useMemo } from "react";
import { apiClient } from "../services/apiClient";

export function useApi() {
  const client = useMemo(() => apiClient, []);
  return client;
}

