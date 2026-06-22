import axios, { AxiosError } from 'axios';

const authBaseURL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080';
const coursesBaseURL = import.meta.env.VITE_COURSES_API_URL || 'http://localhost:8081';

const STORAGE_KEY = 'learnquest_auth';

function addAuth(config: import('axios').InternalAxiosRequestConfig) {
  const raw = localStorage.getItem(STORAGE_KEY);
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

let refreshPromise: Promise<string> | null = null;

async function refreshToken(): Promise<string> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error('No stored auth');
  const { refreshToken: rt } = JSON.parse(raw);
  if (!rt) throw new Error('No refresh token');

  const { data } = await axios.post<{ access_token: string; refresh_token: string }>(
    `${authBaseURL}/api/v1/auth/refresh`,
    { refresh_token: rt },
  );

  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  stored.accessToken = data.access_token;
  stored.refreshToken = data.refresh_token;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

  return data.access_token;
}

function handle401(client: import('axios').AxiosInstance) {
  client.interceptors.response.use(undefined, async (error: AxiosError) => {
    const resp = error.response;
    const code = (resp?.data as { error?: { code?: string } })?.error?.code;

    if (resp?.status === 401 && code === 'ACCESS_TOKEN_INVALID' && error.config && !(error.config as unknown as Record<string, unknown>)._retry) {
      (error.config as unknown as Record<string, unknown>)._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshToken().finally(() => { refreshPromise = null; });
        }
        const newToken = await refreshPromise;
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return client.request(error.config);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = '/';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  });
}

export const authClient = axios.create({
  baseURL: `${authBaseURL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});
authClient.interceptors.request.use(addAuth);
handle401(authClient);

export const coursesClient = axios.create({
  baseURL: `${coursesBaseURL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});
coursesClient.interceptors.request.use(addAuth);
handle401(coursesClient);

/** @deprecated use authClient or coursesClient */
export const apiClient = authClient;
