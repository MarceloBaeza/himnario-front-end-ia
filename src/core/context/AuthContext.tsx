/**
 * Proveedor de autenticación.
 * Solo exporta el componente AuthProvider (cumple react-refresh/only-export-components).
 * El hook useAuth está en src/core/hooks/useAuth.ts.
 */

import { useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User } from '../types/auth';
import { login as loginApi } from '../api/authApi';
import type { LoginCredentials } from '../api/authApi';
import {
  readToken,
  writeToken,
  readUser,
  writeUser,
  clearAuth,
  isTokenExpired,
} from '../storage/authStorage';
import { AuthContext } from './authContextDef';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedToken = readToken();
    if (storedToken !== null && isTokenExpired(storedToken)) {
      clearAuth();
      return null;
    }
    return readUser();
  });
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = readToken();
    if (storedToken !== null && isTokenExpired(storedToken)) return null;
    return storedToken;
  });

  // Detectar token expirado cuando el usuario vuelve a la pestaña
  useEffect(() => {
    function checkExpiry() {
      const storedToken = readToken();
      if (storedToken !== null && isTokenExpired(storedToken)) {
        setUser(null);
        setToken(null);
        clearAuth();
      }
    }
    window.addEventListener('focus', checkExpiry);
    document.addEventListener('visibilitychange', checkExpiry);
    return () => {
      window.removeEventListener('focus', checkExpiry);
      document.removeEventListener('visibilitychange', checkExpiry);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await loginApi(credentials);
    setUser(result.user);
    setToken(result.token);
    writeUser(result.user);
    writeToken(result.token);
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
