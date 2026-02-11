/**
 * Configuración del router de la aplicación.
 * Usa React Router v6 con layout anidado.
 */

import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layout';
import { HymnListPage, HymnDetailPage, NotFoundPage } from '@/features/hymns';

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
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
