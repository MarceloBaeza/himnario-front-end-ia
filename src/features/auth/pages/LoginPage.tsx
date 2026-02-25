/**
 * Página de inicio de sesión.
 * Ruta: /login
 */

import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/hooks';
import { ApiError } from '@/core/api';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/';

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (email.trim().length === 0 || password.length === 0) {
      setErrorMsg('Email y contraseña son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        Iniciar sesión
      </h1>

      <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); }}
            className={[
              'w-full px-3 py-2 rounded-md border text-neutral-900 dark:text-neutral-100',
              'bg-white dark:bg-neutral-800',
              'border-neutral-300 dark:border-neutral-600',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700',
              'placeholder-neutral-400 dark:placeholder-neutral-500',
            ].join(' ')}
            placeholder="usuario@ejemplo.com"
            required
          />
        </div>

        {/* Contraseña */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); }}
            className={[
              'w-full px-3 py-2 rounded-md border text-neutral-900 dark:text-neutral-100',
              'bg-white dark:bg-neutral-800',
              'border-neutral-300 dark:border-neutral-600',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700',
            ].join(' ')}
            required
          />
        </div>

        {/* Error */}
        {errorMsg !== null && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errorMsg}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            'w-full py-2 px-4 rounded-md font-medium text-white transition-colors',
            'bg-primary-700 hover:bg-primary-800',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2',
            'disabled:opacity-60 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
        ¿No tienes cuenta?{' '}
        <Link
          to="/register"
          className="text-primary-700 dark:text-primary-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 rounded"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
