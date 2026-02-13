/**
 * Implementación del repositorio de himnos que lee desde Google Drive.
 *
 * SOLUCIÓN TEMPORAL: Los himnos viven como archivos JSON en una carpeta
 * pública de Google Drive. Se accede vía Google Drive API v3 con API key.
 *
 * Cache de 2 niveles:
 *   - localStorage (TTL de 1 hora): persiste entre sesiones, carga instantánea
 *   - Memoria: persiste durante la sesión actual, acceso más rápido aún
 *
 * Capas de cache en memoria:
 *   1. fileMap (filename → driveFileId): se carga una vez al listar la carpeta
 *   2. indexCache (HymnIndexEntry[]): se carga una vez al descargar index.json
 *   3. hymnCache (id → Hymn): se llena incrementalmente por cada getById()
 */

import { z } from 'zod';
import type { IHymnRepository } from './IHymnRepository';
import type { Hymn, HymnIndexEntry } from '../types';
import { hymnIndexSchema, hymnSchema } from './schemas';
import { driveFileListSchema } from './googleDriveSchemas';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3/files';

// ── Cache en localStorage ──────────────────────────────────────────────

const CACHE_PREFIX = 'himnario:drive:';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

/** Schemas para validar datos cacheados en localStorage */
const cachedFileMapSchema = z.object({
  d: z.record(z.string(), z.string()),
  ts: z.number(),
});

const cachedIndexSchema = z.object({
  d: hymnIndexSchema,
  ts: z.number(),
});

const cachedHymnSchema = z.object({
  d: hymnSchema,
  ts: z.number(),
});

/**
 * Parsea JSON retornando `unknown` en vez de `any`.
 */
function safeJsonParse(text: string): unknown {
  return JSON.parse(text) as unknown;
}

function readCachedFileMap(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + 'fileMap');
    if (raw === null) return null;
    const result = cachedFileMapSchema.safeParse(safeJsonParse(raw));
    if (!result.success || Date.now() - result.data.ts > CACHE_TTL_MS) return null;
    return result.data.d;
  } catch {
    // localStorage no disponible o datos corruptos
    return null;
  }
}

function writeCachedFileMap(data: Record<string, string>): void {
  try {
    localStorage.setItem(
      CACHE_PREFIX + 'fileMap',
      JSON.stringify({ d: data, ts: Date.now() })
    );
  } catch {
    // Cuota excedida, modo privado, etc.
  }
}

function readCachedIndex(): HymnIndexEntry[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + 'index');
    if (raw === null) return null;
    const result = cachedIndexSchema.safeParse(safeJsonParse(raw));
    if (!result.success || Date.now() - result.data.ts > CACHE_TTL_MS) return null;
    return result.data.d;
  } catch {
    // localStorage no disponible o datos corruptos
    return null;
  }
}

function writeCachedIndex(data: HymnIndexEntry[]): void {
  try {
    localStorage.setItem(
      CACHE_PREFIX + 'index',
      JSON.stringify({ d: data, ts: Date.now() })
    );
  } catch {
    // Cuota excedida, modo privado, etc.
  }
}

function readCachedHymn(id: string): Hymn | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + 'hymn:' + id);
    if (raw === null) return null;
    const result = cachedHymnSchema.safeParse(safeJsonParse(raw));
    if (!result.success || Date.now() - result.data.ts > CACHE_TTL_MS) return null;
    return result.data.d;
  } catch {
    // localStorage no disponible o datos corruptos
    return null;
  }
}

function writeCachedHymn(id: string, data: Hymn): void {
  try {
    localStorage.setItem(
      CACHE_PREFIX + 'hymn:' + id,
      JSON.stringify({ d: data, ts: Date.now() })
    );
  } catch {
    // Cuota excedida, modo privado, etc.
  }
}

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

  /** Capa 1: mapa de nombre de archivo → ID de archivo en Drive */
  private fileMap: Map<string, string> | null = null;

  /** Capa 2: índice de himnos cacheado */
  private indexCache: HymnIndexEntry[] | null = null;

  /** Capa 3: himnos individuales cacheados por ID */
  private readonly hymnCache = new Map<string, Hymn>();

  constructor(apiKey: string, folderId: string) {
    this.apiKey = apiKey;
    this.folderId = folderId;
  }

  /**
   * Carga el mapa de archivos de la carpeta de Drive (solo la primera vez).
   * Usa paginación para obtener todos los archivos.
   */
  private async ensureFileMap(): Promise<Map<string, string>> {
    if (this.fileMap !== null) {
      return this.fileMap;
    }

    // Intentar localStorage
    const cached = readCachedFileMap();
    if (cached !== null) {
      this.fileMap = new Map(Object.entries(cached));
      return this.fileMap;
    }

    // Fetch desde Google Drive
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

      // Extraer nextPageToken si existe
      const rawObj = raw as Record<string, unknown>;
      pageToken =
        typeof rawObj['nextPageToken'] === 'string'
          ? rawObj['nextPageToken']
          : undefined;
    } while (pageToken !== undefined);

    this.fileMap = map;
    writeCachedFileMap(Object.fromEntries(map));
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

  /**
   * Obtiene el ID de Drive de un archivo por su nombre.
   */
  private async getDriveFileId(filename: string): Promise<string> {
    const map = await this.ensureFileMap();
    const driveId = map.get(filename);

    if (driveId === undefined) {
      throw new Error(
        `Archivo "${filename}" no encontrado en la carpeta de Google Drive`
      );
    }

    return driveId;
  }

  async getIndex(): Promise<HymnIndexEntry[]> {
    if (this.indexCache !== null) {
      return this.indexCache;
    }

    // Intentar localStorage
    const cached = readCachedIndex();
    if (cached !== null) {
      this.indexCache = cached;
      return cached;
    }

    // Fetch desde Google Drive
    const driveFileId = await this.getDriveFileId('index.json');
    const raw = await this.downloadFile(driveFileId);
    const result = hymnIndexSchema.safeParse(raw);

    if (!result.success) {
      throw new Error(
        `El índice de himnos tiene un formato inválido: ${result.error.message}`
      );
    }

    this.indexCache = result.data;
    writeCachedIndex(result.data);
    return result.data;
  }

  async getById(id: string): Promise<Hymn> {
    // Memoria (más rápido)
    const memCached = this.hymnCache.get(id);
    if (memCached !== undefined) {
      return memCached;
    }

    // localStorage
    const storageCached = readCachedHymn(id);
    if (storageCached !== null) {
      this.hymnCache.set(id, storageCached);
      return storageCached;
    }

    // Fetch desde Google Drive
    const index = await this.getIndex();
    const entry = index.find((e) => e.id === id);

    if (entry === undefined) {
      throw new Error(`Himno con id "${id}" no encontrado en el índice`);
    }

    const driveFileId = await this.getDriveFileId(entry.file);
    const raw = await this.downloadFile(driveFileId);
    const result = hymnSchema.safeParse(raw);

    if (!result.success) {
      throw new Error(
        `El himno "${id}" tiene un formato inválido: ${result.error.message}`
      );
    }

    this.hymnCache.set(id, result.data);
    writeCachedHymn(id, result.data);
    return result.data;
  }
}
