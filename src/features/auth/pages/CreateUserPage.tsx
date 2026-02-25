/**
 * Página de creación de usuario por parte de un administrador.
 * Ruta: /admin/usuarios/nuevo  (protegida — solo rol 'admin')
 */

import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/hooks';
import { createUser, ApiError } from '@/core/api';
import type { UserRole } from '@/core/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;

// ── Requisitos de contraseña ────────────────────────────────────────────────

interface PasswordChecks {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
}

function checkPassword(pwd: string): PasswordChecks {
  return {
    minLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
  };
}

type StrengthLevel = 0 | 1 | 2 | 3;

function getStrength(pwd: string, checks: PasswordChecks): StrengthLevel {
  if (pwd.length === 0) return 0;
  const allRequired = checks.minLength && checks.hasUpper && checks.hasLower && checks.hasNumber;
  if (!allRequired) return 1;
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  if (pwd.length >= 12 && hasSpecial) return 3;
  return 2;
}

const STRENGTH_META: Record<
  1 | 2 | 3,
  { label: string; barColor: string; textColor: string; segments: number }
> = {
  1: { label: 'Débil', barColor: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400', segments: 1 },
  2: { label: 'Media', barColor: 'bg-yellow-400', textColor: 'text-yellow-600 dark:text-yellow-400', segments: 2 },
  3: { label: 'Fuerte', barColor: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400', segments: 3 },
};

function PasswordStrengthBar({ pwd }: { pwd: string }) {
  const checks = checkPassword(pwd);
  const level = getStrength(pwd, checks);
  if (level === 0) return null;

  const meta = STRENGTH_META[level];

  return (
    <div className="mt-2 space-y-2">
      {/* Barra de fuerza */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1" aria-hidden="true">
          {[1, 2, 3].map((seg) => (
            <div
              key={seg}
              className={[
                'h-1.5 flex-1 rounded-full transition-colors duration-300',
                seg <= level ? meta.barColor : 'bg-neutral-200 dark:bg-neutral-700',
              ].join(' ')}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${meta.textColor}`} aria-live="polite">
          {meta.label}
        </span>
      </div>

      {/* Checklist de requisitos */}
      <ul className="space-y-0.5" aria-label="Requisitos de contraseña">
        {(
          [
            { key: 'minLength', label: 'Mínimo 8 caracteres' },
            { key: 'hasUpper', label: 'Al menos una mayúscula (A–Z)' },
            { key: 'hasLower', label: 'Al menos una minúscula (a–z)' },
            { key: 'hasNumber', label: 'Al menos un número (0–9)' },
          ] as { key: keyof PasswordChecks; label: string }[]
        ).map(({ key, label }) => (
          <li
            key={key}
            className={[
              'flex items-center gap-1.5 text-xs',
              checks[key]
                ? 'text-green-600 dark:text-green-400'
                : 'text-neutral-500 dark:text-neutral-400',
            ].join(' ')}
          >
            <span aria-hidden="true">{checks[key] ? '✓' : '○'}</span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Validación ──────────────────────────────────────────────────────────────

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): FieldErrors {
  const errors: FieldErrors = {};

  if (name.trim().length === 0) errors.name = 'El nombre es obligatorio.';

  const trimmedEmail = email.trim();
  if (trimmedEmail.length === 0) {
    errors.email = 'El email es obligatorio.';
  } else if (!EMAIL_RE.test(trimmedEmail)) {
    errors.email = 'Ingresa un email válido (ej. usuario@dominio.com).';
  }

  if (password.length === 0) {
    errors.password = 'La contraseña es obligatoria.';
  } else {
    const checks = checkPassword(password);
    if (!checks.minLength) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (!checks.hasUpper || !checks.hasLower || !checks.hasNumber) {
      errors.password = 'La contraseña debe incluir mayúsculas, minúsculas y números.';
    }
  }

  if (confirmPassword.length === 0) {
    errors.confirmPassword = 'Confirma la contraseña.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  return errors;
}

// ── Página ──────────────────────────────────────────────────────────────────

export function CreateUserPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRole('viewer');
    setFieldErrors({});
    setErrorMsg(null);
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const errors = validate(name, email, password, confirmPassword);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    if (token === null) {
      setErrorMsg('No tienes sesión activa. Vuelve a iniciar sesión.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createUser(
        { name: name.trim(), email: email.trim().toLowerCase(), password, role },
        token
      );
      setSuccessMsg(`Usuario "${name.trim()}" creado correctamente.`);
      resetForm();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields !== undefined && Object.keys(err.fields).length > 0) {
          setFieldErrors(err.fields as FieldErrors);
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg('Error inesperado. Intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = [
    'w-full px-3 py-2 rounded-md border text-neutral-900 dark:text-neutral-100',
    'bg-white dark:bg-neutral-800',
    'border-neutral-300 dark:border-neutral-600',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700',
    'placeholder-neutral-400 dark:placeholder-neutral-500',
  ].join(' ');

  const inputWithError = `${inputBase} border-red-500 dark:border-red-400`;

  return (
    <div className="max-w-sm mx-auto mt-8 px-4">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => { navigate(-1); }}
          className="text-sm text-primary-700 dark:text-primary-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 rounded"
          aria-label="Volver a la página anterior"
        >
          ← Volver
        </button>
      </div>

      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        Crear usuario
      </h1>

      {successMsg !== null && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 px-4 py-3 text-sm text-green-800 dark:text-green-300"
        >
          {successMsg}
        </div>
      )}

      <form
        onSubmit={(e) => { void handleSubmit(e); }}
        noValidate
        className="space-y-4"
        aria-label="Formulario de creación de usuario"
      >
        {/* Nombre */}
        <div>
          <label htmlFor="cu-name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Nombre completo
          </label>
          <input
            id="cu-name"
            type="text"
            autoComplete="off"
            value={name}
            onChange={(e) => { setName(e.target.value); }}
            maxLength={MAX_NAME_LENGTH}
            className={fieldErrors.name !== undefined ? inputWithError : inputBase}
            placeholder="Nombre del usuario"
            aria-describedby={fieldErrors.name !== undefined ? 'cu-name-error' : undefined}
            aria-invalid={fieldErrors.name !== undefined}
          />
          {fieldErrors.name !== undefined && (
            <p id="cu-name-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="cu-email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Email
          </label>
          <input
            id="cu-email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => { setEmail(e.target.value); }}
            maxLength={MAX_EMAIL_LENGTH}
            className={fieldErrors.email !== undefined ? inputWithError : inputBase}
            placeholder="usuario@ejemplo.com"
            aria-describedby={fieldErrors.email !== undefined ? 'cu-email-error' : undefined}
            aria-invalid={fieldErrors.email !== undefined}
          />
          {fieldErrors.email !== undefined && (
            <p id="cu-email-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="cu-password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Contraseña
          </label>
          <input
            id="cu-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); }}
            maxLength={128}
            className={fieldErrors.password !== undefined ? inputWithError : inputBase}
            aria-describedby="cu-password-reqs"
            aria-invalid={fieldErrors.password !== undefined}
          />
          <div id="cu-password-reqs">
            <PasswordStrengthBar pwd={password} />
          </div>
          {fieldErrors.password !== undefined && (
            <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label htmlFor="cu-confirm-password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Confirmar contraseña
          </label>
          <input
            id="cu-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); }}
            maxLength={128}
            className={fieldErrors.confirmPassword !== undefined ? inputWithError : inputBase}
            aria-describedby={fieldErrors.confirmPassword !== undefined ? 'cu-confirm-error' : undefined}
            aria-invalid={fieldErrors.confirmPassword !== undefined}
          />
          {fieldErrors.confirmPassword !== undefined && (
            <p id="cu-confirm-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Rol */}
        <div>
          <label htmlFor="cu-role" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Rol
          </label>
          <select
            id="cu-role"
            value={role}
            onChange={(e) => { setRole(e.target.value as UserRole); }}
            className={`${inputBase} cursor-pointer`}
          >
            <option value="viewer">Viewer — solo lectura</option>
            <option value="editor">Editor — puede crear himnos</option>
            <option value="admin">Admin — acceso completo</option>
          </select>
        </div>

        {errorMsg !== null && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errorMsg}
          </p>
        )}

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
          {isSubmitting ? 'Creando usuario…' : 'Crear usuario'}
        </button>
      </form>
    </div>
  );
}
