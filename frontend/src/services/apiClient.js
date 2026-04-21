import axios from "axios";
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from "../utils/authStorage";

const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const baseURL = rawBaseURL.endsWith("/") ? rawBaseURL.slice(0, -1) : rawBaseURL;

export const apiClient = axios.create({
  baseURL,
  withCredentials: true
});

apiClient.interceptors.request.use(
  (config) => {
    // If URL does NOT start with / and it's not an absolute URL, add it
    // Most standard is to use /path in axios calls with a baseURL that has no trailing slash
    if (config.url && !config.url.startsWith("/") && !config.url.startsWith("http")) {
      config.url = `/${config.url}`;
    }
    
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/token/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${baseURL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        const { access, refresh: newRefresh } = data;
        setAccessToken(access);
        if (newRefresh) setRefreshToken(newRefresh);
        processQueue(null, access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        // Option: redirect to login
        // window.location.href = '/login'; 
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

