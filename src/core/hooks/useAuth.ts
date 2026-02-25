/**
 * Hook para acceder al contexto de autenticación.
 * Lanza un error si se usa fuera de AuthProvider.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/authContextDef';
import type { AuthContextValue } from '../context/authContextDef';

export type { AuthContextValue };

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
