/**
 * Implementación del repositorio de himnos que lee desde Google Drive.
 *
 * SOLUCIÓN TEMPORAL: Los himnos viven como archivos JSON en una carpeta
 * pública de Google Drive. Se accede vía Google Drive API v3 con API key.
 *
 * Sin caché — siempre fetch fresco desde Drive.
 */

import type { IHymnRepository } from './IHymnRepository';
import type { Hymn, HymnIndexEntry } from '../types';
import { hymnIndexSchema, hymnSchema } from './schemas';
import { driveFileListSchema } from './googleDriveSchemas';

// Las peticiones van a /api/drive/* y el proxy de Vite las redirige a googleapis.com
const DRIVE_API_BASE = '/api/drive';

// ── Fetch helpers ──────────────────────────────────────────────────────

/**
 * Realiza un fetch y parsea la respuesta como JSON unknown.
 * Evita el uso de `any` al retornar `unknown`.
 */
async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Error al cargar ${url}: ${String(response.status)} ${response.statusText}`
    );
  }
  return response.json() as Promise<unknown>;
}

// ── Repository ─────────────────────────────────────────────────────────

export class GoogleDriveHymnRepository implements IHymnRepository {
  private readonly apiKey: string;
  private readonly folderId: string;

  constructor(apiKey: string, folderId: string) {
    this.apiKey = apiKey;
    this.folderId = folderId;
  }

  /**
   * Lista todos los archivos de la carpeta de Drive.
   * Usa paginación para obtener todos los archivos.
   */
  private async loadFileMap(): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    let pageToken: string | undefined;

    do {
      const params = new URLSearchParams({
        q: `'${this.folderId}' in parents and trashed = false`,
        key: this.apiKey,
        fields: 'nextPageToken,files(id,name)',
        pageSize: '1000',
      });

      if (pageToken !== undefined) {
        params.set('pageToken', pageToken);
      }

      const url = `${DRIVE_API_BASE}?${params.toString()}`;
      const raw = await fetchJson(url);
      const result = driveFileListSchema.safeParse(raw);

      if (!result.success) {
        throw new Error(
          `La respuesta de Google Drive tiene un formato inválido: ${result.error.message}`
        );
      }

      for (const file of result.data.files) {
        map.set(file.name, file.id);
      }

      const rawObj = raw as Record<string, unknown>;
      pageToken =
        typeof rawObj['nextPageToken'] === 'string'
          ? rawObj['nextPageToken']
          : undefined;
    } while (pageToken !== undefined);

    return map;
  }

  /**
   * Descarga el contenido de un archivo de Drive por su ID.
   */
  private async downloadFile(driveFileId: string): Promise<unknown> {
    const params = new URLSearchParams({
      alt: 'media',
      key: this.apiKey,
    });

    const url = `${DRIVE_API_BASE}/${driveFileId}?${params.toString()}`;
    return fetchJson(url);
  }

  async getIndex(): Promise<HymnIndexEntry[]> {
    const fileMap = await this.loadFileMap();
    const driveId = fileMap.get('index.json');

    if (driveId === undefined) {
      throw new Error(
        'Archivo "index.json" no encontrado en la carpeta de Google Drive'
      );
    }

    const raw = await this.downloadFile(driveId);
    const result = hymnIndexSchema.safeParse(raw);

    if (!result.success) {
      throw new Error(
        `El índice de himnos tiene un formato inválido: ${result.error.message}`
      );
    }

    return result.data;
  }

  async getById(id: string): Promise<Hymn> {
    const index = await this.getIndex();
    const entry = index.find((e) => e.id === id);

    if (entry === undefined) {
      throw new Error(`Himno con id "${id}" no encontrado en el índice`);
    }

    const fileMap = await this.loadFileMap();
    const driveId = fileMap.get(entry.file);

    if (driveId === undefined) {
      throw new Error(
        `Archivo "${entry.file}" no encontrado en la carpeta de Google Drive`
      );
    }

    const raw = await this.downloadFile(driveId);
    const result = hymnSchema.safeParse(raw);

    if (!result.success) {
      throw new Error(
        `El himno "${id}" tiene un formato inválido: ${result.error.message}`
      );
    }

    return result.data;
  }
}
