/** Tipos de dominio para autenticación y usuarios */

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
