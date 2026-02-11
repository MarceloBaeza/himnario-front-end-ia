/**
 * Control de tamaño de fuente para la vista de detalle del himno.
 * Botones A- y A+ con límites min/max y reset opcional.
 * Completamente accesible por teclado.
 */

import type { UseFontSizeReturn } from '@/core/hooks';

interface FontSizeControlProps {
  fontSizeState: UseFontSizeReturn;
}

export function FontSizeControl({ fontSizeState }: FontSizeControlProps) {
  const { fontSize, increase, decrease, reset, isAtMin, isAtMax, min, max } = fontSizeState;

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Control de tamaño de letra"
    >
      <span className="text-xs text-neutral-500 dark:text-neutral-400 mr-1 hidden sm:inline" aria-hidden="true">
        Tamaño:
      </span>

      {/* Botón disminuir */}
      <button
        type="button"
        onClick={decrease}
        disabled={isAtMin}
        aria-label={`Disminuir tamaño de letra (mínimo ${String(min)}px)`}
        title="Disminuir tamaño de letra"
        className={[
          'inline-flex items-center justify-center w-9 h-9 rounded-md border text-sm font-bold',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-neutral-900',
          isAtMin
            ? 'border-neutral-200 dark:border-neutral-700 text-neutral-300 dark:text-neutral-600 cursor-not-allowed bg-neutral-50 dark:bg-neutral-800'
            : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 bg-white dark:bg-neutral-800',
        ].join(' ')}
        aria-disabled={isAtMin}
      >
        A<span className="text-xs align-sub leading-none">−</span>
      </button>

      {/* Indicador de tamaño actual */}
      <span
        className="text-xs text-neutral-600 dark:text-neutral-400 w-12 text-center tabular-nums"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Tamaño de letra actual: ${String(fontSize)} píxeles`}
      >
        {fontSize}px
      </span>

      {/* Botón aumentar */}
      <button
        type="button"
        onClick={increase}
        disabled={isAtMax}
        aria-label={`Aumentar tamaño de letra (máximo ${String(max)}px)`}
        title="Aumentar tamaño de letra"
        className={[
          'inline-flex items-center justify-center w-9 h-9 rounded-md border text-sm font-bold',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-neutral-900',
          isAtMax
            ? 'border-neutral-200 dark:border-neutral-700 text-neutral-300 dark:text-neutral-600 cursor-not-allowed bg-neutral-50 dark:bg-neutral-800'
            : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 bg-white dark:bg-neutral-800',
        ].join(' ')}
        aria-disabled={isAtMax}
      >
        A<span className="text-sm align-text-top leading-none">+</span>
      </button>

      {/* Botón reset */}
      <button
        type="button"
        onClick={reset}
        aria-label="Restablecer tamaño de letra al valor por defecto"
        title="Restablecer tamaño"
        className={[
          'inline-flex items-center justify-center px-2 h-9 rounded-md border text-xs',
          'border-neutral-300 dark:border-neutral-600',
          'text-neutral-500 dark:text-neutral-400',
          'bg-white dark:bg-neutral-800',
          'hover:bg-neutral-100 dark:hover:bg-neutral-700',
          'hover:text-neutral-700 dark:hover:text-neutral-200',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-neutral-900',
        ].join(' ')}
      >
        Reset
      </button>
    </div>
  );
}
