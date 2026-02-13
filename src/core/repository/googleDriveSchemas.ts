/**
 * Schemas de validación Zod para las respuestas de la API de Google Drive v3.
 * Garantizan que las respuestas tengan la forma esperada, sin uso de `any`.
 */

import { z } from 'zod';

/** Schema para un archivo individual en la respuesta de Google Drive */
export const driveFileSchema = z.object({
  id: z.string().min(1, 'El id del archivo de Drive no puede estar vacío'),
  name: z.string().min(1, 'El nombre del archivo de Drive no puede estar vacío'),
});

/** Schema para la respuesta de listado de archivos de Google Drive */
export const driveFileListSchema = z.object({
  files: z.array(driveFileSchema),
});

export type DriveFile = z.infer<typeof driveFileSchema>;
export type DriveFileList = z.infer<typeof driveFileListSchema>;
