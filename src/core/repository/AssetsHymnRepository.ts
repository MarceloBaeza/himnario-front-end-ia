/**
 * Implementación del repositorio de himnos que lee desde assets estáticos.
 *
 * SUPUESTO FASE 1: No existe backend. Los himnos viven como archivos JSON
 * en /public/himnos/ (copiados a /himnos/ en build). El índice (index.json) es obligatorio porque
 * no se pueden listar directorios en runtime en el navegador.
 *
 * Preparado para migración futura: solo esta clase necesita cambiar
 * cuando haya un backend, el resto de la app se mantiene igual.
 */

import type { IHymnRepository } from './IHymnRepository';
import type { Hymn, HymnIndexEntry } from '../types';
import { hymnIndexSchema, hymnSchema } from './schemas';

/**
 * Realiza un fetch y parsea la respuesta como JSON unknown.
 * Evita el uso de `any` al retornar `unknown`.
 */
async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al cargar ${url}: ${String(response.status)} ${response.statusText}`);
  }
  return response.json() as Promise<unknown>;
}

export class AssetsHymnRepository implements IHymnRepository {
  private readonly basePath: string;

  constructor(basePath = '/himnos') {
    this.basePath = basePath;
  }

  async getIndex(): Promise<HymnIndexEntry[]> {
    const raw = await fetchJson(`${this.basePath}/index.json`);
    const result = hymnIndexSchema.safeParse(raw);

    if (!result.success) {
      throw new Error(
        `El índice de himnos tiene un formato inválido: ${result.error.message}`
      );
    }

    return result.data;
  }

  async getById(id: string): Promise<Hymn> {
    // Primero buscamos el archivo en el índice para obtener el nombre exacto
    const index = await this.getIndex();
    const entry = index.find((e) => e.id === id);

    if (entry === undefined) {
      throw new Error(`Himno con id "${id}" no encontrado en el índice`);
    }

    if (entry.file === undefined) {
      throw new Error(`El himno "${id}" no tiene archivo de asset asociado`);
    }

    const raw = await fetchJson(`${this.basePath}/${entry.file}`);
    const result = hymnSchema.safeParse(raw);

    if (!result.success) {
      throw new Error(
        `El himno "${id}" tiene un formato inválido: ${result.error.message}`
      );
    }

    return result.data;
  }
}

/** Instancia singleton del repositorio (para uso en la app) */
export const hymnRepository: IHymnRepository = new AssetsHymnRepository();
