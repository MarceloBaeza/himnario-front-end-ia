/**
 * Spinner de carga accesible con aria-live y role apropiados.
 */

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Cargando...' }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="flex flex-col items-center justify-center py-16 gap-4"
    >
      <div
        className="w-10 h-10 border-4 border-primary-200 dark:border-primary-900 border-t-primary-700 dark:border-t-primary-400 rounded-full animate-spin"
        aria-hidden="true"
      />
      <p className="text-neutral-500 dark:text-neutral-400 text-sm">{message}</p>
    </div>
  );
}
