/**
 * Schemas de validación Zod para los datos de himnos.
 * Garantizan que los JSON de los assets tengan la forma correcta,
 * sin uso de `any`.
 */

import { z } from 'zod';

export const hymnIndexEntrySchema = z.object({
  id: z.string().min(1, 'El id no puede estar vacío'),
  title: z.string().min(1, 'El título no puede estar vacío'),
  author: z.string().optional(),
  file: z.string().min(1).optional(),
});

export const hymnIndexSchema = z.array(hymnIndexEntrySchema);

export const hymnSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  author: z.string().optional(),
  content: z.string().min(1, 'El contenido no puede estar vacío'),
  createdAt: z.string().datetime({ offset: true }).optional(),
});

export type HymnIndexEntryRaw = z.infer<typeof hymnIndexEntrySchema>;
export type HymnRaw = z.infer<typeof hymnSchema>;
