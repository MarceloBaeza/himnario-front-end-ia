/**
 * Página de registro de usuario.
 * Ruta: /register
 */

import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/hooks';
import { ApiError } from '@/core/api';
import type { UserRole } from '@/core/types';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    // Validación básica cliente
    if (email.trim().length === 0 || password.length === 0 || name.trim().length === 0) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }
    if (password.length < 8) {
      setFieldErrors({ password: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        role,
      });
      navigate('/login', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields !== undefined && Object.keys(err.fields).length > 0) {
          setFieldErrors(err.fields);
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg('Error al registrarse. Intenta de nuevo.');
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
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        Crear cuenta
      </h1>

      <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="space-y-4">
        {/* Nombre */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Nombre
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => { setName(e.target.value); }}
            className={inputClass}
            placeholder="Tu nombre"
            required
          />
        </div>

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
            className={inputClass}
            placeholder="usuario@ejemplo.com"
            required
          />
          {fieldErrors['email'] !== undefined && (
            <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors['email']}
            </p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Contraseña <span className="text-neutral-400 font-normal">(mín. 8 caracteres)</span>
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); }}
            className={inputClass}
            required
          />
          {fieldErrors['password'] !== undefined && (
            <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors['password']}
            </p>
          )}
        </div>

        {/* Rol */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Rol
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => { setRole(e.target.value as UserRole); }}
            className={[inputClass, 'cursor-pointer'].join(' ')}
          >
            <option value="viewer">Viewer — solo lectura</option>
            <option value="editor">Editor — puede crear himnos</option>
            <option value="admin">Admin — acceso completo</option>
          </select>
        </div>

        {/* Error general */}
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
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
        ¿Ya tienes cuenta?{' '}
        <Link
          to="/login"
          className="text-primary-700 dark:text-primary-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 rounded"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
