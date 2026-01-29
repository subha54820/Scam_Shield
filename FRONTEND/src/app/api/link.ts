import { apiUrl } from './config';
import { getStoredAuth } from './auth';

export interface LinkCheckResult {
  is_valid: boolean;
  is_safe: boolean;
  domain: string | null;
  ssl_valid: boolean;
  risk_level: string;
  risk_score: number;
  red_flags: string[];
  analysis: string;
}

export async function checkLink(url: string): Promise<LinkCheckResult> {
  const auth = getStoredAuth();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (auth?.token) headers['Authorization'] = `Token ${auth.token}`;
  let res: Response;
  try {
    res = await fetch(apiUrl('/link/check/'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ url: url.trim() }),
    });
  } catch (e) {
    throw new Error('Cannot reach server. Ensure the backend is running (e.g. py manage.py runserver).');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Link check failed');
  return data;
}
