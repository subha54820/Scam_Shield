import { apiUrl } from './config';
import { getStoredAuth } from './auth';

export interface QuizOption {
  id: number;
  text: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  explanation: string;
  category: string;
  difficulty: string;
}

export interface QuizSubmitResponse {
  score: number;
  total: number;
  percentage: number;
  feedback: string[];
}

export async function getQuizQuestions(): Promise<{ questions: QuizQuestion[] }> {
  const res = await fetch(apiUrl('/quiz/questions/'));
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load questions');
  return data;
}

export async function submitQuiz(answers: Record<string, number>): Promise<QuizSubmitResponse> {
  const auth = getStoredAuth();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (auth?.token) headers['Authorization'] = `Token ${auth.token}`;
  const res = await fetch(apiUrl('/quiz/submit/'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ answers }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Submit failed');
  return data;
}

export interface QuizAttemptItem {
  id: number;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
}

export async function getQuizHistory(page = 1, limit = 10): Promise<{ attempts: QuizAttemptItem[]; total: number; page: number; limit: number }> {
  const auth = getStoredAuth();
  if (!auth?.token) throw new Error('Login required');
  const res = await fetch(apiUrl(`/quiz/history/?page=${page}&limit=${limit}`), {
    headers: { Authorization: `Token ${auth.token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load quiz history');
  return data;
}
