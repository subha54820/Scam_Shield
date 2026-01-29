const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export function validateEmail(value: string): string | null {
  const v = (value || '').trim();
  if (!v) return 'Email is required';
  if (!EMAIL_REGEX.test(v)) return 'Enter a valid email address';
  return null;
}

export function validateEmailOptional(value: string): string | null {
  const v = (value || '').trim();
  if (!v) return null;
  if (!EMAIL_REGEX.test(v)) return 'Enter a valid email address';
  return null;
}

export function validateUsername(value: string): string | null {
  const v = (value || '').trim();
  if (!v) return 'Username is required';
  if (v.length < 3) return 'Username must be at least 3 characters';
  if (v.length > 30) return 'Username must be at most 30 characters';
  if (!USERNAME_REGEX.test(v)) return 'Username can only contain letters, numbers, underscore and hyphen';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export function validatePasswordSignUp(value: string): string | null {
  const err = validatePassword(value);
  if (err) return err;
  if (value.length > 128) return 'Password is too long';
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  const v = (value || '').trim();
  if (!v) return `${label} is required`;
  return null;
}

export function validateMessage(value: string, minLen = 10): string | null {
  const v = (value || '').trim();
  if (!v) return 'Message is required';
  if (v.length < minLen) return `Message must be at least ${minLen} characters`;
  if (v.length > 10000) return 'Message is too long';
  return null;
}

export function validateUrl(value: string): string | null {
  const v = (value || '').trim();
  if (!v) return 'URL is required';
  try {
    new URL(v);
    if (!URL_REGEX.test(v)) return 'URL must start with http:// or https://';
    return null;
  } catch {
    return 'Enter a valid URL';
  }
}

export function validateScamContent(value: string): string | null {
  const v = (value || '').trim();
  if (!v) return 'Scam content or message is required';
  if (v.length < 20) return 'Please provide at least 20 characters of details';
  if (v.length > 5000) return 'Content is too long';
  return null;
}

export function validateRecoveryCode(value: string): string | null {
  if (!value || value.length !== 6) return 'Enter the 6-digit recovery code';
  if (!/^\d{6}$/.test(value)) return 'Code must be 6 digits';
  return null;
}

export function restrictToDigits(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '');
  return maxLength != null ? digits.slice(0, maxLength) : digits;
}

export function restrictPhone(value: string, maxLength = 15): string {
  return restrictToDigits(value, maxLength);
}
