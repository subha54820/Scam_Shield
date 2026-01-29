import { apiUrl } from './config';
import { getStoredAuth } from './auth';

function authFetch(path: string, options: RequestInit = {}) {
  const auth = getStoredAuth();
  if (!auth?.token) throw new Error('Login required');
  const headers: HeadersInit = { ...options.headers };
  headers['Authorization'] = `Token ${auth.token}`;
  return fetch(apiUrl(path), { ...options, headers });
}

export interface UserProfile {
  user_id: number;
  email: string;
  name: string;
  created_at: string | null;
}

export interface UserStats {
  total_scans: number;
  scams_detected: number;
  safe_detected: number;
  quiz_score: number;
  join_date: string | null;
}

export interface ScanItem {
  id: number;
  content: string;
  risk_level: string;
  risk_score: number;
  created_at: string;
}

export interface ReportItem {
  report_id: string;
  content: string;
  scam_type: string;
  platform: string;
  status: string;
  created_at: string;
}

export async function getProfile(): Promise<UserProfile> {
  const res = await authFetch('/user/profile/');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load profile');
  return data;
}

export async function updateProfile(payload: { name?: string; email?: string }): Promise<UserProfile> {
  const body: { name?: string; email?: string } = {};
  if (payload.email !== undefined) body.email = payload.email;
  if (payload.name !== undefined) body.name = payload.name;
  const res = await authFetch('/user/profile/', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update failed');
  return data;
}

export async function deleteAccount(): Promise<void> {
  const res = await authFetch('/user/profile/', { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Delete failed');
  }
}

export async function getStats(): Promise<UserStats> {
  const res = await authFetch('/user/stats/');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load stats');
  return data;
}

export async function getMessageHistory(page = 1, limit = 10): Promise<{ scans: ScanItem[]; total: number; page: number; limit: number }> {
  const res = await authFetch(`/message/history/?page=${page}&limit=${limit}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load history');
  return data;
}

export async function getLinkHistory(page = 1, limit = 10): Promise<{ scans: ScanItem[]; total: number; page: number; limit: number }> {
  const res = await authFetch(`/link/history/?page=${page}&limit=${limit}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load history');
  return data;
}

export async function getMyReports(page = 1, limit = 10): Promise<{ reports: ReportItem[]; total: number; page: number; limit: number }> {
  const res = await authFetch(`/report/my-reports/?page=${page}&limit=${limit}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load reports');
  return data;
}
