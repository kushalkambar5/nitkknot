import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Ideally from env var
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor for handling errors (e.g. 401 logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: Handle token expiry (401) by logging out
    // if (error.response && error.response.status === 401) {
    //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  },
);

export default api;
