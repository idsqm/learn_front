import { create } from 'zustand';
import { authApi } from '../api/authApi';

interface User {
  username: string;
  email: string;
  role: 'student' | 'author';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<string>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
  fetchUser: () => Promise<void>;
  initialize: () => void;
}

const STORAGE_KEY = 'learnquest_auth';

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
}

function tokenExpiresIn(token: string): number {
  const payload = parseJwt(token);
  if (!payload?.exp) return 0;
  return (payload.exp as number) * 1000 - Date.now();
}

async function fetchUser(accessToken?: string): Promise<User> {
  const me = await authApi.getMe(accessToken);
  return { username: me.username, email: me.email, role: (me.role === 'author' ? 'author' : 'student') };
}

function saveToStorage(accessToken: string, refreshToken: string, user: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, refreshToken, user }));
}

function loadFromStorage(): { accessToken: string; refreshToken: string; user: User } | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRefresh(get: () => AuthState) {
  if (refreshTimer) clearTimeout(refreshTimer);
  const { accessToken, refreshToken } = get();
  if (!accessToken || !refreshToken) return;

  const expiresIn = tokenExpiresIn(accessToken);
  const refreshIn = Math.max(expiresIn - 60_000, 5_000);

  refreshTimer = setTimeout(async () => {
    try {
      const tokens = await authApi.refresh(refreshToken);
      const user = await fetchUser(tokens.access_token);
      useAuthStore.setState({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, user, isAuthenticated: true });
      saveToStorage(tokens.access_token, tokens.refresh_token, user);
      scheduleRefresh(useAuthStore.getState as () => AuthState);
    } catch {
      useAuthStore.getState().logout();
    }
  }, refreshIn);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,

  initialize: () => {
    const stored = loadFromStorage();
    if (!stored) {
      set({ loading: false });
      return;
    }

    const expiresIn = tokenExpiresIn(stored.accessToken);
    if (expiresIn > 5_000) {
      set({
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken,
        user: stored.user,
        isAuthenticated: true,
        loading: false,
      });
      scheduleRefresh(get);
      fetchUser().then(user => {
        set({ user });
        saveToStorage(stored.accessToken, stored.refreshToken, user);
      }).catch(() => {});
    } else if (stored.refreshToken) {
      authApi.refresh(stored.refreshToken)
        .then(async tokens => {
          const user = await fetchUser(tokens.access_token);
          set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, user, isAuthenticated: true, loading: false });
          saveToStorage(tokens.access_token, tokens.refresh_token, user);
          scheduleRefresh(get);
        })
        .catch(() => {
          clearStorage();
          set({ loading: false });
        });
    } else {
      clearStorage();
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    const tokens = await authApi.login(email, password);
    const user = await fetchUser(tokens.access_token);
    set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, user, isAuthenticated: true });
    saveToStorage(tokens.access_token, tokens.refresh_token, user);
    scheduleRefresh(get);
  },

  register: async (username, email, password) => {
    const res = await authApi.register(username, email, password);
    return res.message;
  },

  logout: () => {
    if (refreshTimer) clearTimeout(refreshTimer);
    clearStorage();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  fetchUser: async () => {
    const user = await fetchUser();
    const { accessToken, refreshToken } = get();
    set({ user });
    if (accessToken && refreshToken) saveToStorage(accessToken, refreshToken, user);
  },

  getAccessToken: async () => {
    const { accessToken, refreshToken } = get();
    if (accessToken && tokenExpiresIn(accessToken) > 5_000) return accessToken;
    if (!refreshToken) return null;
    try {
      const tokens = await authApi.refresh(refreshToken);
      const user = await fetchUser(tokens.access_token);
      set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, user, isAuthenticated: true });
      saveToStorage(tokens.access_token, tokens.refresh_token, user);
      scheduleRefresh(get);
      return tokens.access_token;
    } catch {
      get().logout();
      return null;
    }
  },
}));
