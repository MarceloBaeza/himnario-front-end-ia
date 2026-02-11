/**
 * Interfaz del repositorio de himnos.
 * Abstracción que permite cambiar la fuente de datos (assets, API, etc.)
 * en el futuro sin modificar la capa de UI.
 */

import type { Hymn, HymnIndexEntry } from '../types';

export interface IHymnRepository {
  /**
   * Obtiene la lista de todos los himnos del índice.
   * Retorna solo metadatos (sin contenido completo).
   */
  getIndex(): Promise<HymnIndexEntry[]>;

  /**
   * Obtiene un himno completo por su ID.
   * @throws Error si el himno no se encuentra o el JSON es inválido
   */
  getById(id: string): Promise<Hymn>;
}
