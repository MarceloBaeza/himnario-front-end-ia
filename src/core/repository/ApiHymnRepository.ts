/**
 * Implementación del repositorio de himnos usando la API REST del backend.
 *
 * - getIndex()  → GET /hymn/all  (id, title, created_at)
 * - getById(id) → GET /hymn/:id  (id, title, content JSONB, created_at)
 *
 * El backend devuelve content como { content: "texto plano con \n saltos" }.
 */

import { z } from 'zod';
import { apiGet } from '../api/apiClient';
import type { IHymnRepository } from './IHymnRepository';
import type { Hymn, HymnIndexEntry } from '../types';

// ── Schemas de respuesta de la API ────────────────────────────────────────

const apiHymnListItemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  created_at: z.string(),
});

const apiHymnDetailSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  content: z.object({
    content: z.string(),
  }),
  created_at: z.string(),
});

// ── Repositorio ───────────────────────────────────────────────────────────

export class ApiHymnRepository implements IHymnRepository {
  async getIndex(): Promise<HymnIndexEntry[]> {
    const raw = await apiGet<unknown>('/hymn/all');
    const result = z.array(apiHymnListItemSchema).safeParse(raw);

    if (!result.success) {
      throw new Error(`Respuesta de API inválida al listar himnos: ${result.error.message}`);
    }

    return result.data.map((item) => ({
      id: String(item.id),
      title: item.title,
    }));
  }

  async getById(id: string): Promise<Hymn> {
    const raw = await apiGet<unknown>(`/hymn/${id}`);
    const result = apiHymnDetailSchema.safeParse(raw);

    if (!result.success) {
      throw new Error(`Respuesta de API inválida para himno ${id}: ${result.error.message}`);
    }

    const item = result.data;
    return {
      id: String(item.id),
      title: item.title,
      content: item.content.content,
      createdAt: item.created_at,
    };
  }
}
