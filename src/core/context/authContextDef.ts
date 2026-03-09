/**
 * Definición del objeto Context y del tipo de valor.
 * Separado del componente AuthProvider para cumplir la regla react-refresh/only-export-components.
 */

import { createContext } from 'react';
import type { AuthState, User } from '../types/auth';
import type { LoginCredentials } from '../api/authApi';

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
AuthContext.displayName = 'AuthContext';

export type { LoginCredentials, User };
