/**
 * Notificación toast fija en la parte inferior de la pantalla.
 * El padre controla `visible`; el ocultado (timeout) es responsabilidad del padre.
 */

interface ToastProps {
  message: string;
  visible: boolean;
}

export function Toast({ message, visible }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={[
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg',
        'bg-green-700 dark:bg-green-600 text-white text-sm font-medium whitespace-nowrap',
        'transition-all duration-300 ease-out',
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-3 pointer-events-none',
      ].join(' ')}
    >
      {/* Ícono checkmark */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        className="w-4 h-4 flex-shrink-0"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>
  );
}
