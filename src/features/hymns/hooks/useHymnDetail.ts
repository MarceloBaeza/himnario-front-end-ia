/**
 * Hook para cargar el detalle de un himno por su ID.
 * Gestiona estados de carga y error de forma robusta.
 */

import { useState, useEffect } from 'react';
import type { Hymn, LoadingState, AppError } from '@/core/types';
import { hymnRepository } from '@/core/repository';

interface UseHymnDetailReturn {
  hymn: Hymn | null;
  loadingState: LoadingState;
  error: AppError | null;
  retry: () => void;
}

export function useHymnDetail(id: string): UseHymnDetailReturn {
  const [hymn, setHymn] = useState<Hymn | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<AppError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (id.trim().length === 0) {
      setError({ message: 'ID de himno inválido' });
      setLoadingState('error');
      return;
    }

    let isCancelled = false;

    const loadHymn = async () => {
      setLoadingState('loading');
      setError(null);
      setHymn(null);

      try {
        const data = await hymnRepository.getById(id);

        if (!isCancelled) {
          setHymn(data);
          setLoadingState('success');
        }
      } catch (err) {
        if (!isCancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'Error desconocido al cargar el himno';
          setError({ message });
          setLoadingState('error');
        }
      }
    };

    void loadHymn();

    return () => {
      isCancelled = true;
    };
  }, [id, retryCount]);

  const retry = () => {
    setRetryCount((prev) => prev + 1);
  };

  return { hymn, loadingState, error, retry };
}
