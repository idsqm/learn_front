import { authClient as apiClient, coursesClient } from '../../../shared/api/apiClient';
import { AxiosError } from 'axios';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface Session {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  expires_at: string;
  created_at: string;
}

export class AuthApiError extends Error {
  status: number;
  code: string | null;
  fieldErrors: Record<string, string[]> | null;

  constructor(
    status: number,
    code: string | null,
    fieldErrors: Record<string, string[]> | null,
  ) {
    super(code || 'Validation error');
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

function handleError(err: unknown): never {
  if (err instanceof AxiosError && err.response) {
    const { status, data } = err.response;
    if (data?.errors) {
      throw new AuthApiError(status, null, data.errors);
    }
    if (data?.error) {
      throw new AuthApiError(status, data.error.code, null);
    }
    throw new AuthApiError(status, 'UNKNOWN', null);
  }
  throw err;
}

export const authApi = {
  async register(username: string, email: string, password: string) {
    try {
      const { data } = await apiClient.post<{ message: string }>('/auth/register', { username, email, password });
      return data;
    } catch (err) { handleError(err); }
  },

  async verifyEmail(token: string) {
    try {
      const { data } = await apiClient.post<{ message: string }>('/auth/verify-email', { token });
      return data;
    } catch (err) { handleError(err); }
  },

  async login(email: string, password: string) {
    try {
      const { data } = await apiClient.post<TokenResponse>('/auth/login', { email, password });
      return data;
    } catch (err) { handleError(err); }
  },

  async refresh(refreshToken: string) {
    try {
      const { data } = await apiClient.post<TokenResponse>('/auth/refresh', { refresh_token: refreshToken });
      return data;
    } catch (err) { handleError(err); }
  },

  async logout(sessionId: string) {
    try {
      const { data } = await apiClient.post<{ message: string }>('/auth/logout', { session_id: sessionId });
      return data;
    } catch (err) { handleError(err); }
  },

  async getSessions() {
    try {
      const { data } = await apiClient.get<{ sessions: Session[] }>('/auth/sessions');
      return data;
    } catch (err) { handleError(err); }
  },

  async requestPasswordReset(email: string) {
    try {
      const { data } = await apiClient.post<{ message: string }>('/auth/password/reset-request', { email });
      return data;
    } catch (err) { handleError(err); }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      const { data } = await apiClient.post<{ message: string }>('/auth/password/reset', { token, new_password: newPassword });
      return data;
    } catch (err) { handleError(err); }
  },

  async getMe(accessToken?: string) {
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
      const { data } = await apiClient.get<{ id: string; username: string; email: string; role: string }>('/auth/me', { headers });
      return data;
    } catch (err) { handleError(err); }
  },

  async applyAsAuthor(profile: { name: string; subtitle: string; bio: string; years_experience: number }) {
    try {
      const { data } = await coursesClient.post<{ message: string }>('/authors/apply', profile);
      return data;
    } catch (err) { handleError(err); }
  },
};
