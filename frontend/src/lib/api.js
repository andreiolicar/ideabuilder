import axios from "axios";

const AUTH_STORAGE_KEY = "tcc_auth";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredAuth = (authData) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

let isRefreshing = false;
let refreshQueue = [];

const flushQueue = (error, accessToken) => {
  refreshQueue.forEach((request) => {
    if (error) {
      request.reject(error);
      return;
    }

    request.resolve(accessToken);
  });

  refreshQueue = [];
};

api.interceptors.request.use((config) => {
  const stored = getStoredAuth();
  if (stored?.accessToken) {
    config.headers.Authorization = `Bearer ${stored.accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (status !== 401 || originalRequest?._retry) {
      throw error;
    }

    const stored = getStoredAuth();
    if (!stored?.refreshToken) {
      clearStoredAuth();
      throw error;
    }

    if (isRefreshing) {
      const newAccessToken = await new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      originalRequest._retry = true;
      return api(originalRequest);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
        refreshToken: stored.refreshToken
      });

      const nextAuth = {
        ...stored,
        accessToken: refreshResponse.data.accessToken,
        refreshToken: refreshResponse.data.refreshToken || stored.refreshToken
      };

      setStoredAuth(nextAuth);
      flushQueue(null, nextAuth.accessToken);

      originalRequest.headers.Authorization = `Bearer ${nextAuth.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearStoredAuth();
      flushQueue(refreshError, null);
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
