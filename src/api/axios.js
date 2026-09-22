import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9090";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Token if present & auto-detect FormData
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("smartlf_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Remove default JSON Content-Type header when sending FormData to let browser generate boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Authentication Errors (e.g. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid session if token expired or unauthorized
      localStorage.removeItem("smartlf_token");
      localStorage.removeItem("smartlf_user");
      localStorage.removeItem("smartlf_page");
      window.dispatchEvent(new Event("smartlf:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
