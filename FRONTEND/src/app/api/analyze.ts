import { apiUrl } from './config';

export interface AnalyzeResult {
  input_message: string;
  risk_level: string;
  scam_score: number;
  red_flags?: string[];
  confidence?: number;
  explanation?: string;
  tips?: string[];
  detected_keywords: string[];
  scam_type: string;
  explanation_for_user: string;
  detailed_reasons: string[];
  safety_tips: string[];
  detected_categories?: string[];
  language_detected?: string;
  odia_reasons?: string[];
  hindi_reasons?: string[];
  english_reasons?: string[];
}

export async function analyzeMessage(message: string): Promise<AnalyzeResult> {
  let res: Response;
  try {
    res = await fetch(apiUrl('/analyze/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.trim() }),
    });
  } catch (e) {
    throw new Error('Cannot reach server. Ensure the backend is running (e.g. py manage.py runserver).');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Analysis failed');
  return data;
}
