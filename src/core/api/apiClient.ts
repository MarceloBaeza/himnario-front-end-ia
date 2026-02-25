/**
 * Cliente HTTP para el backend de Himnario.
 * - Agrega los headers requeridos (x-client, country, event-id, Accept)
 * - Desenvuelve el wrapper { responseOk | responseError }
 * - Lanza ApiError con el mensaje y código de estado del backend
 */

import { clearAuth } from '../storage/authStorage';

/** URL base del backend. Configurable con VITE_API_BASE_URL; por defecto usa el proxy de Vite. */
const API_BASE: string = import.meta.env.VITE_API_BASE_URL ?? '/api/backend';

// ── Shapes de respuesta ──────────────────────────────────────────────────

interface ApiOkResponse<T> {
  responseOk: {
    statusCode: number;
    message: string;
    data?: T;
  };
}

interface ApiErrorResponse {
  responseError: {
    statusCode: number;
    error: string;
    data?: Record<string, string>;
  };
}

function isErrorResponse(raw: unknown): raw is ApiErrorResponse {
  return typeof raw === 'object' && raw !== null && 'responseError' in raw;
}

function isOkResponse<T>(raw: unknown): raw is ApiOkResponse<T> {
  return typeof raw === 'object' && raw !== null && 'responseOk' in raw;
}

// ── Error tipado ─────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly fields?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Helpers internos ─────────────────────────────────────────────────────

function makeEventId(): string {
  return `fe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function baseHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'x-client': 'front-end-himnary',
    country: 'CL',
    'event-id': makeEventId(),
    Accept: 'application/json',
  };
  if (token !== undefined) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function unwrap<T>(response: Response): Promise<T> {
  // Sesión expirada o token inválido: limpiar estado y redirigir a login.
  if (response.status === 401) {
    clearAuth();
    window.location.replace('/login');
    throw new ApiError('Sesión expirada. Inicia sesión de nuevo.', 401);
  }

  let raw: unknown;
  try {
    raw = (await response.json()) as unknown;
  } catch {
    throw new ApiError(
      `Error del servidor (${String(response.status)})`,
      response.status
    );
  }

  if (isErrorResponse(raw)) {
    throw new ApiError(
      raw.responseError.error,
      raw.responseError.statusCode,
      raw.responseError.data
    );
  }

  if (isOkResponse<T>(raw)) {
    return raw.responseOk.data as T;
  }

  throw new ApiError('Respuesta inesperada del servidor', response.status);
}

// ── API pública ───────────────────────────────────────────────────────────

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, { method: 'GET', headers: baseHeaders(token) });
  return unwrap<T>(response);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      ...baseHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return unwrap<T>(response);
}
