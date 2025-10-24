import axios from "axios";

export const client = axios.create({
  baseURL:
    import.meta.env.VITE_SERVER_URL || "http://localhost:3000",
  withCredentials: true,
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
