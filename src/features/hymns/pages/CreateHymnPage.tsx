/**
 * Página para crear un himno nuevo.
 * Ruta: /himno/nuevo  (protegida — admin o editor)
 */

import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/core/hooks';
import { createHymn, ApiError } from '@/core/api';

export function CreateHymnPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [author, setAuthor] = useState('');
  const [writtenAt, setWrittenAt] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (title.trim().length === 0) errors['title'] = 'El título es obligatorio.';
    if (rawContent.trim().length === 0) errors['content'] = 'El contenido es obligatorio.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (user === null || token === null) {
      setErrorMsg('Debes iniciar sesión para crear himnos.');
      return;
    }

    const content = {
      content: rawContent.trim(),
      ...(author.trim().length > 0 && { author: author.trim() }),
      ...(writtenAt.trim().length > 0 && { writtenAt: writtenAt.trim() }),
    };

    setIsSubmitting(true);
    try {
      await createHymn(
        { title: title.trim(), content, user: { email: user.email, name: user.name } },
        token
      );
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields !== undefined && Object.keys(err.fields).length > 0) {
          setFieldErrors(err.fields);
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg('Error al crear el himno. Intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = [
    'w-full px-3 py-2 rounded-md border text-neutral-900 dark:text-neutral-100',
    'bg-white dark:bg-neutral-800',
    'border-neutral-300 dark:border-neutral-600',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700',
    'placeholder-neutral-400 dark:placeholder-neutral-500',
  ].join(' ');

  return (
    <article>
      <nav aria-label="Miga de pan" className="mb-6">
        <Link
          to="/"
          className={[
            'inline-flex items-center gap-1.5 text-sm text-primary-700 dark:text-primary-400',
            'hover:text-primary-900 dark:hover:text-primary-300 hover:underline',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-neutral-900 rounded transition-colors',
          ].join(' ')}
          aria-label="Volver a la lista de himnos"
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
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a Himnos
        </Link>
      </nav>

      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        Nuevo himno
      </h1>

      <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="space-y-5">
        {/* Título */}
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <label
              htmlFor="hymn-title"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Título <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <span
              className={`text-xs ${title.length >= 50 ? 'text-red-500 dark:text-red-400' : 'text-neutral-400 dark:text-neutral-500'}`}
              aria-live="polite"
            >
              {title.length}/50
            </span>
          </div>
          <input
            id="hymn-title"
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); }}
            maxLength={50}
            className={inputClass}
            placeholder="Nombre del himno"
            required
          />
          {fieldErrors['title'] !== undefined && (
            <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors['title']}
            </p>
          )}
        </div>

        {/* Contenido */}
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <label
              htmlFor="hymn-content"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Letra <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <span
              className={`text-xs ${rawContent.length >= 1000 ? 'text-red-500 dark:text-red-400' : 'text-neutral-400 dark:text-neutral-500'}`}
              aria-live="polite"
            >
              {rawContent.length}/1000
            </span>
          </div>
          <textarea
            id="hymn-content"
            value={rawContent}
            onChange={(e) => { setRawContent(e.target.value); }}
            rows={16}
            maxLength={1000}
            className={[inputClass, 'resize-y font-mono text-sm leading-relaxed'].join(' ')}
            placeholder={'Escribe aquí la letra del himno...'}
            spellCheck={false}
          />
          {fieldErrors['content'] !== undefined && (
            <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors['content']}
            </p>
          )}
        </div>

        {/* Autor (opcional) */}
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <label
              htmlFor="hymn-author"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Autor{' '}
              <span className="text-neutral-400 dark:text-neutral-500 font-normal text-xs">(opcional)</span>
            </label>
            {author.length > 0 && (
              <span
                className={`text-xs ${author.length >= 30 ? 'text-red-500 dark:text-red-400' : 'text-neutral-400 dark:text-neutral-500'}`}
                aria-live="polite"
              >
                {author.length}/30
              </span>
            )}
          </div>
          <input
            id="hymn-author"
            type="text"
            value={author}
            onChange={(e) => { setAuthor(e.target.value); }}
            maxLength={30}
            className={inputClass}
            placeholder="Nombre del autor"
          />
        </div>

        {/* Fecha de escritura (opcional) */}
        <div>
          <label
            htmlFor="hymn-written-at"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Fecha de escritura{' '}
            <span className="text-neutral-400 dark:text-neutral-500 font-normal text-xs">(opcional)</span>
          </label>
          <input
            id="hymn-written-at"
            type="date"
            value={writtenAt}
            onChange={(e) => { setWrittenAt(e.target.value); }}
            className={[
              inputClass,
              'cursor-pointer',
              '[&::-webkit-calendar-picker-indicator]:opacity-60',
              '[&::-webkit-calendar-picker-indicator]:dark:invert',
            ].join(' ')}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>

        {/* Error general */}
        {errorMsg !== null && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errorMsg}
          </p>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={[
              'py-2 px-6 rounded-md font-medium text-white transition-colors',
              'bg-primary-700 hover:bg-primary-800',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2',
              'disabled:opacity-60 disabled:cursor-not-allowed',
            ].join(' ')}
          >
            {isSubmitting ? 'Guardando…' : 'Guardar himno'}
          </button>
          <Link
            to="/"
            className={[
              'py-2 px-4 rounded-md font-medium transition-colors',
              'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2',
            ].join(' ')}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </article>
  );
}
