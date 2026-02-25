/**
 * Proveedor de autenticación.
 * Solo exporta el componente AuthProvider (cumple react-refresh/only-export-components).
 * El hook useAuth está en src/core/hooks/useAuth.ts.
 */

import { useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types/auth';
import { login as loginApi, register as registerApi } from '../api/authApi';
import type { LoginCredentials, RegisterData } from '../api/authApi';
import {
  readToken,
  writeToken,
  readUser,
  writeUser,
  clearAuth,
} from '../storage/authStorage';
import { AuthContext } from './authContextDef';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readUser());
  const [token, setToken] = useState<string | null>(() => readToken());

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await loginApi(credentials);
    setUser(result.user);
    setToken(result.token);
    writeUser(result.user);
    writeToken(result.token);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await registerApi(data);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: user !== null && token !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
