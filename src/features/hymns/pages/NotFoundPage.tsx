/**
 * Página 404 - Himno o ruta no encontrada.
 */

import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="flex flex-col items-center justify-center py-16 gap-4 text-center"
    >
      <h1
        id="not-found-title"
        className="text-6xl font-bold text-neutral-200 dark:text-neutral-700"
        aria-label="Página no encontrada"
      >
        404
      </h1>
      <p className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">Página no encontrada</p>
      <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className={[
          'mt-4 px-5 py-2.5 bg-primary-700 text-white rounded-md text-sm font-medium',
          'hover:bg-primary-800 dark:hover:bg-primary-600 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-neutral-900',
        ].join(' ')}
      >
        Volver al inicio
      </Link>
    </section>
  );
}
