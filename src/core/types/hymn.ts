/**
 * Tipos del dominio de Himnos.
 * Todos los tipos son estrictos, sin uso de `any`.
 */

/** Representa un himno completo con letra */
export interface Hymn {
  id: string;
  title: string;
  author?: string;
  content: string;
  createdAt?: string;
}

/** Entrada en el índice de himnos (sin contenido completo) */
export interface HymnIndexEntry {
  id: string;
  title: string;
  author?: string;
  /** Solo presente en la implementación de assets estáticos. Ausente en la API REST. */
  file?: string;
}

/** Estado de carga genérico */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/** Error tipado de la aplicación */
export interface AppError {
  message: string;
  code?: string;
}
