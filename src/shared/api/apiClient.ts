import axios from 'axios';

const authBaseURL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080';
const coursesBaseURL = import.meta.env.VITE_COURSES_API_URL || 'http://localhost:8081';

function addAuth(config: import('axios').InternalAxiosRequestConfig) {
  const raw = localStorage.getItem('learnquest_auth');
  if (raw) {
    try {
      const { accessToken } = JSON.parse(raw);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch { /* skip */ }
  }
  return config;
}

export const authClient = axios.create({
  baseURL: `${authBaseURL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});
authClient.interceptors.request.use(addAuth);

export const coursesClient = axios.create({
  baseURL: `${coursesBaseURL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});
coursesClient.interceptors.request.use(addAuth);

/** @deprecated use authClient or coursesClient */
export const apiClient = authClient;
