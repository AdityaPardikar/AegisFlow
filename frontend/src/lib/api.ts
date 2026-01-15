import axios from "axios";

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "/api/v1";
  if (url !== "/api/v1" && !url.endsWith("/api/v1")) {
    url = `${url}/api/v1`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
