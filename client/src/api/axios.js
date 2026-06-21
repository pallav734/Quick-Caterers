import axios from "axios";

//Creating instance 

// You can configure things once and use them everywhere.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    // Only logout if it's auth/me OR token invalid
    if (
      error.response?.status === 401 &&
      error.config.url.includes("/auth/me")
    ) {
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;