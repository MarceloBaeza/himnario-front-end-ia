export type { IHymnRepository } from './IHymnRepository';
export { AssetsHymnRepository } from './AssetsHymnRepository';
export { ApiHymnRepository } from './ApiHymnRepository';
export { hymnIndexSchema, hymnSchema } from './schemas';

import type { IHymnRepository } from './IHymnRepository';
import { ApiHymnRepository } from './ApiHymnRepository';

/** Instancia singleton del repositorio — apunta al backend REST en Fase 2 */
export const hymnRepository: IHymnRepository = new ApiHymnRepository();
