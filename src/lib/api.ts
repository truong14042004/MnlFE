import axios from 'axios';

export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5050';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
});

// Attach JWT (if present) so the backend can resolve the user from the token.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface AuthUser {
  userId: string;
  username: string;
  fullName: string;
  token?: string;
  message?: string;
}

export interface AuthPayload {
  username: string;
  password: string;
  fullName?: string;
}

export function saveAuthUser(user: AuthUser) {
  localStorage.setItem('userId', user.userId);
  localStorage.setItem('username', user.username);
  localStorage.setItem('displayName', user.fullName || user.username);
  if (user.token) localStorage.setItem('token', user.token);
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const userId = localStorage.getItem('userId');
  if (!userId || userId === 'anon') return null;
  return {
    userId,
    username: localStorage.getItem('username') || '',
    displayName: localStorage.getItem('displayName') || localStorage.getItem('username') || 'User',
  };
}

export function clearAuthUser() {
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('displayName');
  localStorage.removeItem('token');
}

export function getCurrentUserId(): string {
  if (typeof window === 'undefined') return 'anon';
  const query = new URLSearchParams(window.location.search);
  const qUserId = query.get('userId');
  if (qUserId) {
    localStorage.setItem('userId', qUserId);
    const qUsername = query.get('username');
    const qDisplayName = query.get('displayName');
    if (qUsername) localStorage.setItem('username', qUsername);
    if (qDisplayName) localStorage.setItem('displayName', qDisplayName);
    const qToken = query.get('token');
    if (qToken) localStorage.setItem('token', qToken);
    try {
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (_) {}
    return qUserId;
  }
  return localStorage.getItem('userId') || 'anon';
}

export function getActiveUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const query = new URLSearchParams(window.location.search);
  const qUserId = query.get('userId');
  if (qUserId) {
    localStorage.setItem('userId', qUserId);
    const qUsername = query.get('username');
    const qDisplayName = query.get('displayName');
    if (qUsername) localStorage.setItem('username', qUsername);
    if (qDisplayName) localStorage.setItem('displayName', qDisplayName);
    const qToken = query.get('token');
    if (qToken) localStorage.setItem('token', qToken);
    try {
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
      window.dispatchEvent(new Event('detox-auth-changed'));
    } catch (_) {}
    return qUserId;
  }

  const storedUserId = localStorage.getItem('userId');
  if (!storedUserId) return null;
  return storedUserId;
}

export interface SiteTotal {
  website: string;
  totalSeconds: number;
}

export interface DailyTotal {
  day: string;
  totalSeconds: number;
  byWebsite: Record<string, number>;
}

export interface Summary {
  totalSeconds: number;
  awarenessScore: number;
  byWebsite: SiteTotal[];
  daily: DailyTotal[];
  recommendations: string[];
}

export async function fetchSummary(userId = 'anon', days = 7): Promise<Summary> {
  const { data } = await api.get('/api/stats/summary', { params: { userId, days } });
  return data;
}

export async function login(payload: AuthPayload): Promise<AuthUser> {
  const { data } = await api.post('/api/auth/login', payload);
  return data;
}

export async function register(payload: AuthPayload): Promise<AuthUser> {
  const { data } = await api.post('/api/auth/register', payload);
  return data;
}

export function formatMinutes(seconds: number): string {
  if (!seconds) return '0p';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}p`;
  return `${h}g ${m}p`;
}
