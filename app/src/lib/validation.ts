import type { RegisterCredentials, UserRole } from '@/types';

export interface ValidationResult {
  valid: boolean;
  emailError?: string;
  passwordError?: string;
  usernameError?: string;
}

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Email is required';
  if (!email.includes('@')) return 'Email must contain an "@" symbol';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Email format is invalid (e.g., user@example.com)';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&* etc.)';
  }
  return undefined;
}

export function validateUsername(username: string): string | undefined {
  if (!username.trim()) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 50) return 'Username must be less than 50 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
  return undefined;
}

export function validateRegistration(credentials: RegisterCredentials): ValidationResult {
  const emailError = validateEmail(credentials.email);
  const passwordError = validatePassword(credentials.password);
  const usernameError = validateUsername(credentials.username);

  const errors = [emailError, passwordError, usernameError].filter(Boolean);
  return {
    valid: errors.length === 0,
    emailError,
    passwordError,
    usernameError,
  };
}

export function isCreatorOrAdmin(role: UserRole): boolean {
  return role === 'creator' || role === 'admin';
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}
