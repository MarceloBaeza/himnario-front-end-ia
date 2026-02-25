/**
 * Configuración del router de la aplicación.
 * Usa React Router v6 con layout anidado.
 *
 * Rutas públicas:  /  /hymn/:id  /login  /register
 * Rutas protegidas: /himno/nuevo  (admin o editor)
 */

import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layout';
import { HymnListPage, HymnDetailPage, NotFoundPage, CreateHymnPage } from '@/features/hymns';
import { LoginPage, RegisterPage, CreateUserPage } from '@/features/auth';
import { ProtectedRoute } from './components';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HymnListPage />,
      },
      {
        path: 'hymn/:id',
        element: <HymnDetailPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'himno/nuevo',
        element: (
          <ProtectedRoute requiredRoles={['admin', 'editor']}>
            <CreateHymnPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/usuarios/nuevo',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <CreateUserPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
