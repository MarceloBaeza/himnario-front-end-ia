/**
 * Página principal: listado de himnos con búsqueda.
 * Ruta: /
 *
 * Características:
 * - Búsqueda fuzzy/parcial solo en título (case-insensitive, normaliza tildes)
 * - Debounce de 300ms para evitar filtrado en cada keystroke
 * - Estados: loading, error, empty, results
 * - Orden alfabético por título
 * - Accesibilidad: landmarks, aria-labels, focus management
 */

import { useHymnList } from '../hooks';
import { HymnCard } from '../components/HymnCard';
import { SearchInput } from '../components/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';

const HYMN_LIST_ID = 'hymn-list';

export function HymnListPage() {
  const {
    filteredHymns,
    searchQuery,
    setSearchQuery,
    loadingState,
    error,
    retry,
  } = useHymnList();

  return (
    <section aria-labelledby="page-title">
      <h1
        id="page-title"
        className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6"
      >
        Himnos
      </h1>

      {/* Búsqueda */}
      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          resultsId={HYMN_LIST_ID}
          resultsCount={
            loadingState === 'success' ? filteredHymns.length : undefined
          }
        />
      </div>

      {/* Estados de carga */}
      {loadingState === 'loading' && (
        <LoadingSpinner message="Cargando himnos..." />
      )}

      {loadingState === 'error' && error !== null && (
        <ErrorMessage message={error.message} onRetry={retry} />
      )}

      {/* Lista de himnos */}
      {loadingState === 'success' && filteredHymns.length === 0 && (
        <EmptyState
          title={
            searchQuery.trim().length > 0
              ? `Sin resultados para "${searchQuery}"`
              : 'No hay himnos disponibles'
          }
          description={
            searchQuery.trim().length > 0
              ? 'Intenta con otro término de búsqueda'
              : 'No se encontraron himnos en el índice'
          }
        />
      )}

      {loadingState === 'success' && filteredHymns.length > 0 && (
        <ul
          id={HYMN_LIST_ID}
          aria-label="Lista de himnos"
          role="list"
          className="space-y-2"
        >
          {filteredHymns.map((hymn) => (
            <HymnCard key={hymn.id} hymn={hymn} />
          ))}
        </ul>
      )}
    </section>
  );
}
