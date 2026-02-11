/**
 * Componente para mostrar mensajes de error de forma accesible.
 */

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center justify-center py-16 gap-4 text-center"
    >
      <div
        className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="w-6 h-6 text-primary-700 dark:text-primary-400"
          aria-hidden="true"
        >
          <circle cx={12} cy={12} r={10} />
          <line x1={12} y1={8} x2={12} y2={12} />
          <line x1={12} y1={16} x2={12.01} y2={16} />
        </svg>
      </div>
      <p className="text-neutral-700 dark:text-neutral-300 font-medium">Ha ocurrido un error</p>
      <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm">{message}</p>
      {onRetry !== undefined && (
        <button
          type="button"
          onClick={onRetry}
          className={[
            'mt-2 px-4 py-2 bg-primary-700 text-white rounded-md text-sm font-medium',
            'hover:bg-primary-800 dark:hover:bg-primary-600',
            'focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2',
            'dark:focus:ring-offset-neutral-900',
            'transition-colors',
          ].join(' ')}
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
