import { apiUrl } from './config';

export interface ReportScamPayload {
  reporter_name?: string;
  email?: string;
  mobile_number?: string;
  scam_content: string;
  scam_type: string;
  platform: string;
  screenshot?: File;
}

export interface ReportScamResponse {
  success: boolean;
  report_id: string;
  message: string;
  error?: string;
}

export async function submitReport(payload: ReportScamPayload): Promise<ReportScamResponse> {
  const form = new FormData();
  if (payload.reporter_name) form.append('reporter_name', payload.reporter_name);
  if (payload.email) form.append('email', payload.email);
  if (payload.mobile_number) form.append('mobile_number', payload.mobile_number);
  form.append('scam_content', payload.scam_content);
  form.append('scam_type', payload.scam_type);
  form.append('platform', payload.platform);
  if (payload.screenshot) form.append('screenshot', payload.screenshot);

  const res = await fetch(apiUrl('/report-scam/'), {
    method: 'POST',
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit report');
  return data;
}

export const REPORT_SCAM_TYPES = [
  'Phishing', 'Fake Payment Request', 'OTP Scam', 'Romance Scam', 'Investment Fraud',
  'Fake Tech Support', 'Malware/Virus', 'Lottery Scam', 'Banking Fraud', 'E-commerce Fraud',
  'Job Offer Scam', 'Credential Harvesting', 'Other',
] as const;

export const REPORT_PLATFORMS = [
  'SMS', 'WhatsApp', 'Email', 'Website', 'Phone Call', 'Social Media', 'Other',
] as const;
