/**
 * Input de búsqueda para la lista de himnos.
 * Accesible: label asociado, aria-controls para indicar qué controla,
 * botón de limpiar accesible por teclado.
 */

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  resultsId?: string;
  resultsCount?: number;
}

export function SearchInput({ value, onChange, resultsId, resultsCount }: SearchInputProps) {
  const hasValue = value.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
  };

  const getResultsText = (count: number): string => {
    if (count === 0) return 'Sin resultados';
    const plural = count !== 1 ? 's' : '';
    return `${String(count)} himno${plural} encontrado${plural}`;
  };

  return (
    <div className="relative">
      <label
        htmlFor="hymn-search"
        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
      >
        Buscar himno
      </label>
      <div className="relative">
        {/* Icono de búsqueda */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4 text-neutral-400 dark:text-neutral-500"
          >
            <circle cx={11} cy={11} r={8} />
            <line x1={21} y1={21} x2={16.65} y2={16.65} />
          </svg>
        </div>

        <input
          id="hymn-search"
          type="search"
          role="searchbox"
          value={value}
          onChange={handleInputChange}
          placeholder="Buscar por título..."
          aria-controls={resultsId}
          aria-label="Buscar himno por título"
          className={[
            'w-full pl-9 pr-9 py-2.5 border rounded-lg',
            'text-neutral-900 dark:text-neutral-100',
            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
            'border-neutral-300 dark:border-neutral-600',
            'bg-white dark:bg-neutral-800',
            'focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700',
            'dark:focus:ring-primary-500 dark:focus:border-primary-500',
            'transition-colors',
          ].join(' ')}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Botón limpiar búsqueda */}
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className={[
              'absolute inset-y-0 right-0 pr-3 flex items-center',
              'text-neutral-400 hover:text-neutral-700',
              'dark:text-neutral-500 dark:hover:text-neutral-300',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700',
              'transition-colors',
            ].join(' ')}
            aria-label="Limpiar búsqueda"
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
              <line x1={18} y1={6} x2={6} y2={18} />
              <line x1={6} y1={6} x2={18} y2={18} />
            </svg>
          </button>
        )}
      </div>

      {/* Conteo de resultados anunciado a lectores de pantalla */}
      {resultsCount !== undefined && (
        <p
          className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {getResultsText(resultsCount)}
        </p>
      )}
    </div>
  );
}
