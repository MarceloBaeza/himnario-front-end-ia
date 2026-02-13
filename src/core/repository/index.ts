export type { IHymnRepository } from './IHymnRepository';
export { AssetsHymnRepository } from './AssetsHymnRepository';
export { GoogleDriveHymnRepository } from './GoogleDriveHymnRepository';
export { hymnIndexSchema, hymnSchema } from './schemas';

import type { IHymnRepository } from './IHymnRepository';
import { GoogleDriveHymnRepository } from './GoogleDriveHymnRepository';

const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const folderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;

if (!apiKey || !folderId) {
  throw new Error(
    'Faltan variables de entorno: VITE_GOOGLE_DRIVE_API_KEY y VITE_GOOGLE_DRIVE_FOLDER_ID deben estar definidas en .env'
  );
}

/** Instancia singleton del repositorio (para uso en la app) */
export const hymnRepository: IHymnRepository = new GoogleDriveHymnRepository(
  apiKey,
  folderId
);
