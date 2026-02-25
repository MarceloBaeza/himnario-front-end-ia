/** Llamadas HTTP para registro y autenticación de usuarios */

import { apiPost } from './apiClient';
import type { User, UserRole } from '../types/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

interface LoginResponseData {
  email: string;
  name: string;
  role: string;
  token: string;
}

export interface LoginResult {
  user: User;
  token: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const data = await apiPost<LoginResponseData>('/user/authentication', credentials);
  return {
    user: {
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
    },
    token: data.token,
  };
}

export async function register(data: RegisterData): Promise<void> {
  await apiPost<undefined>('/user/create', data);
}

/** Crea un usuario desde el panel de administración. Requiere token de admin. */
export async function createUser(data: RegisterData, token: string): Promise<void> {
  await apiPost<undefined>('/user/create', data, token);
}
