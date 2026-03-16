import axios from "axios";

// Change this to your Django backend URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_VERSION = "v1";

const api = axios.create({
  baseURL: `${BASE_URL}/api/${API_VERSION}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add JWT bearer token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
const authApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const auth = {
  login: (username, password) =>
    authApi.post("/login/", { username, password }),
  register: (username, email, password) =>
    authApi.post("/signup/", { username, email, password }),
  refresh: (refresh) =>
    authApi.post("/refresh/", { refresh }),
};

// ─── Artists ──────────────────────────────────────────────────────────────────
export const artistsApi = {
  getAll: (params) => api.get("/artists", { params }),
  getOne: (id) => api.get(`/artists/${id}`),
  create: (data) => api.post("/artists", data),
  update: (id, data) => api.put(`/artists/${id}`, data),
  patch: (id, data) => api.patch(`/artists/${id}`, data),
  delete: (id) => api.delete(`/artists/${id}`),
};

// ─── Albums ───────────────────────────────────────────────────────────────────
export const albumsApi = {
  getAll: (params) => api.get("/albums", { params }),
  getOne: (id) => api.get(`/albums/${id}`),
  create: (data) => api.post("/albums", data),
  update: (id, data) => api.put(`/albums/${id}`, data),
  patch: (id, data) => api.patch(`/albums/${id}`, data),
  delete: (id) => api.delete(`/albums/${id}`),
};

// ─── Tracks ───────────────────────────────────────────────────────────────────
export const tracksApi = {
  getAll: (params) => api.get("/tracks", { params }),
  getOne: (id) => api.get(`/tracks/${id}`),
  create: (data) => api.post("/tracks", data),
  update: (id, data) => api.put(`/tracks/${id}`, data),
  patch: (id, data) => api.patch(`/tracks/${id}`, data),
  delete: (id) => api.delete(`/tracks/${id}`),
};

// ─── Playlists ────────────────────────────────────────────────────────────────
export const playlistsApi = {
  getAll: (params) => api.get("/playlists", { params }),
  getOne: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post("/playlists", data),
  update: (id, data) => api.put(`/playlists/${id}`, data),
  patch: (id, data) => api.patch(`/playlists/${id}`, data),
  delete: (id) => api.delete(`/playlists/${id}`),
};

export default api;