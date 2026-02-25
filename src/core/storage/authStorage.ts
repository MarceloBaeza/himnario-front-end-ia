/** Persistencia del token JWT y datos de usuario en localStorage */

import type { User } from '../types/auth';

const AUTH_TOKEN_KEY = 'himnario:auth:token';
const AUTH_USER_KEY = 'himnario:auth:user';

export function readToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function writeToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function readUser(): User | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function writeUser(user: User): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
