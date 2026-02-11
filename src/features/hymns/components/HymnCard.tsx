/**
 * Tarjeta de himno en la lista.
 * Muestra título y autor (si existe), con navegación al detalle.
 * Accesible: usa elemento <article> con roles apropiados.
 */

import { Link } from 'react-router-dom';
import type { HymnIndexEntry } from '@/core/types';

interface HymnCardProps {
  hymn: HymnIndexEntry;
}

export function HymnCard({ hymn }: HymnCardProps) {
  return (
    <li>
      <Link
        to={`/hymn/${encodeURIComponent(hymn.id)}`}
        className={[
          'flex items-center justify-between p-4 rounded-lg border',
          'border-neutral-200 dark:border-neutral-700',
          'bg-white dark:bg-neutral-800',
          'hover:bg-primary-50 hover:border-primary-200',
          'dark:hover:bg-neutral-700 dark:hover:border-primary-700',
          'transition-colors duration-150 group',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-neutral-900',
        ].join(' ')}
        aria-label={`Ver himno: ${hymn.title}${hymn.author !== undefined ? `, de ${hymn.author}` : ''}`}
      >
        <div className="flex-1 min-w-0">
          <h2 className="text-neutral-900 dark:text-neutral-100 font-semibold text-base group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors truncate">
            {hymn.title}
          </h2>
          {hymn.author !== undefined && (
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5 truncate">{hymn.author}</p>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="w-5 h-5 text-neutral-400 dark:text-neutral-500 group-hover:text-primary-700 dark:group-hover:text-primary-400 flex-shrink-0 ml-3 transition-colors"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </li>
  );
}
