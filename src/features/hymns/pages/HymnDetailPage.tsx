/**
 * Página de detalle de un himno.
 * Ruta: /hymn/:id
 *
 * Características:
 * - Muestra título, autor (si existe) y letra completa
 * - CSS whitespace-pre-line para respetar saltos de línea del contenido
 * - Control A-/A+ con límites min 14px / max 26px
 * - Persistencia del tamaño de fuente en localStorage
 * - Accesible por teclado
 * - Botón "Volver" para navegación
 */

import { useParams, Link } from 'react-router-dom';
import { useHymnDetail } from '../hooks';
import { FontSizeControl } from '../components/FontSizeControl';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useFontSize } from '@/core/hooks';

export function HymnDetailPage() {
  const { id } = useParams<{ id: string }>();
  const hymnId = id ?? '';

  const { hymn, loadingState, error, retry } = useHymnDetail(hymnId);
  const fontSizeState = useFontSize();

  return (
    <article aria-labelledby="hymn-title">
      {/* Navegación de regreso */}
      <nav aria-label="Miga de pan" className="mb-6">
        <Link
          to="/"
          className={[
            'inline-flex items-center gap-1.5 text-sm text-primary-700 dark:text-primary-400',
            'hover:text-primary-900 dark:hover:text-primary-300 hover:underline',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-neutral-900 rounded',
            'transition-colors',
          ].join(' ')}
          aria-label="Volver a la lista de himnos"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a Himnos
        </Link>
      </nav>

      {/* Estado de carga */}
      {loadingState === 'loading' && (
        <LoadingSpinner message="Cargando himno..." />
      )}

      {/* Estado de error */}
      {loadingState === 'error' && error !== null && (
        <ErrorMessage message={error.message} onRetry={retry} />
      )}

      {/* Contenido del himno */}
      {loadingState === 'success' && hymn !== null && (
        <>
          {/* Cabecera: título + control de tamaño */}
          <header className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1
                  id="hymn-title"
                  className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight"
                >
                  {hymn.title}
                </h1>
                {hymn.author !== undefined && (
                  <p
                    className="mt-1 text-neutral-500 dark:text-neutral-400 text-sm"
                    aria-label={`Autor: ${hymn.author}`}
                  >
                    {hymn.author}
                  </p>
                )}
              </div>

              {/* Control de tamaño de fuente */}
              <div className="flex-shrink-0">
                <FontSizeControl fontSizeState={fontSizeState} />
              </div>
            </div>

            {/* Separador */}
            <hr className="mt-4 border-neutral-200 dark:border-neutral-700" aria-hidden="true" />
          </header>

          {/* Letra del himno */}
          <section aria-label="Letra del himno">
            <p
              className="text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line"
              style={{ fontSize: `${String(fontSizeState.fontSize)}px` }}
            >
              {hymn.content}
            </p>
          </section>
        </>
      )}
    </article>
  );
}
