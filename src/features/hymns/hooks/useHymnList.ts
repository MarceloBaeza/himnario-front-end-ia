/**
 * Hook para cargar y filtrar la lista de himnos.
 * Separa la lógica de datos de la presentación.
 *
 * Responsabilidades:
 * - Cargar el índice de himnos desde el repositorio
 * - Filtrar por búsqueda (fuzzy, solo título)
 * - Mantener orden alfabético
 * - Manejar estados: loading, error, success
 */

import { useState, useEffect, useMemo } from 'react';
import type { HymnIndexEntry, LoadingState, AppError } from '@/core/types';
import { hymnRepository } from '@/core/repository';
import { fuzzyMatch } from '@/core/utils';
import { useDebouncedValue } from '@/core/hooks';

interface UseHymnListReturn {
  hymns: HymnIndexEntry[];
  filteredHymns: HymnIndexEntry[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loadingState: LoadingState;
  error: AppError | null;
  retry: () => void;
}

export function useHymnList(): UseHymnListReturn {
  const [hymns, setHymns] = useState<HymnIndexEntry[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<AppError | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    let isCancelled = false;

    const loadHymns = async () => {
      setLoadingState('loading');
      setError(null);

      try {
        const index = await hymnRepository.getIndex();

        if (!isCancelled) {
          // Ordenar alfabéticamente por título
          const sorted = [...index].sort((a, b) =>
            a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })
          );
          setHymns(sorted);
          setLoadingState('success');
        }
      } catch (err) {
        if (!isCancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'Error desconocido al cargar los himnos';
          setError({ message });
          setLoadingState('error');
        }
      }
    };

    void loadHymns();

    return () => {
      isCancelled = true;
    };
  }, [retryCount]);

  const filteredHymns = useMemo(() => {
    if (debouncedQuery.trim().length === 0) return hymns;

    return hymns.filter((hymn) => fuzzyMatch(debouncedQuery, hymn.title));
  }, [hymns, debouncedQuery]);

  const retry = () => {
    setRetryCount((prev) => prev + 1);
  };

  return {
    hymns,
    filteredHymns,
    searchQuery,
    setSearchQuery,
    loadingState,
    error,
    retry,
  };
}
