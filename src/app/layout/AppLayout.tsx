/**
 * Layout principal de la aplicación.
 * Envuelve todas las páginas con Header y área de contenido principal.
 */

import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col transition-colors duration-200">
      <Header />
      <main
        id="main-content"
        className="flex-1 max-w-4xl mx-auto w-full px-4 py-8"
        role="main"
        aria-label="Contenido principal"
        tabIndex={-1}
      >
        <Outlet />
      </main>
      <footer
        className="bg-primary-900 dark:bg-neutral-950 text-primary-200 dark:text-primary-300 text-center py-4 text-xs transition-colors duration-200"
        role="contentinfo"
      >
        <p>Iglesia Bautista Omega &mdash; Himnario Digital</p>
      </footer>
    </div>
  );
}
