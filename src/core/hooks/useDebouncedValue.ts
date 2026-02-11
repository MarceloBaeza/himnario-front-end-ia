/**
 * Hook que retarda la actualización de un valor por `delay` milisegundos.
 * Útil para búsquedas en tiempo real: evita hacer fetch o filtrar
 * en cada keystroke del usuario.
 *
 * @param value - El valor a debounce
 * @param delay - Milisegundos a esperar antes de actualizar (default: 300ms)
 * @returns El valor debounced
 */

import { useState, useEffect } from 'react';

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
