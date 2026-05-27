import axios from 'axios';

export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5050';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
});

export function getCurrentUserId(): string {
  if (typeof window === 'undefined') return 'anon';
  const query = new URLSearchParams(window.location.search);
  const qUserId = query.get('userId');
  if (qUserId) {
    localStorage.setItem('userId', qUserId);
    try {
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (_) {}
    return qUserId;
  }
  return localStorage.getItem('userId') || 'anon';
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

export function formatMinutes(seconds: number): string {
  if (!seconds) return '0p';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}p`;
  return `${h}g ${m}p`;
}
