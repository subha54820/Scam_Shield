import { apiUrl } from './config';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const AUTH_KEY = 'userCredentials';

export function getStoredAuth(): { token: string; user: AuthUser } | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.token && data?.user) return data;
    return null;
  } catch {
    return null;
  }
}

export function setStoredAuth(data: AuthResponse): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem('rememberedDevice');
}

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(apiUrl('/auth/register/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(apiUrl('/auth/login/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function me(token: string): Promise<{ user: AuthUser }> {
  const res = await fetch(apiUrl('/auth/me/'), {
    headers: { Authorization: `Token ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Session invalid');
  return data;
}

export async function recoveryRequest(email: string): Promise<{ message: string }> {
  const res = await fetch(apiUrl('/auth/recovery/request/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function recoveryVerify(email: string, code: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(apiUrl('/auth/recovery/verify/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, new_password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Verification failed');
  return data;
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
  const auth = getStoredAuth();
  if (!auth?.token) throw new Error('Login required');
  const url = apiUrl('/auth/change-password/');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${auth.token}`,
    },
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
  const contentType = res.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (text.startsWith('<!') || text.startsWith('<')) {
      throw new Error('Server returned an error page. Check that the backend is running and VITE_API_URL points to it.');
    }
    throw new Error(res.ok ? 'Invalid response from server' : `Request failed (${res.status})`);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to change password');
  return data;
}
