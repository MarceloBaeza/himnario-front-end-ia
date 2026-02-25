/**
 * Componente de ruta protegida.
 * - Si no está autenticado → redirige a /login (guardando la ruta de origen)
 * - Si no tiene el rol requerido → redirige a /
 */

import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/hooks';
import type { UserRole } from '@/core/types';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Roles que tienen acceso. Si se omite, cualquier usuario autenticado puede entrar. */
  requiredRoles?: UserRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    requiredRoles !== undefined &&
    user !== null &&
    !requiredRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
