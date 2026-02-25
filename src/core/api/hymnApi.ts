/** Llamadas HTTP para crear himnos (requiere JWT) */

import { apiPost } from './apiClient';

export interface HymnContent {
  content: string;
  author?: string;
  writtenAt?: string;
}

interface CreateHymnBody {
  title: string;
  content: HymnContent;
  user: {
    email: string;
    name: string;
  };
}

export async function createHymn(body: CreateHymnBody, token: string): Promise<void> {
  await apiPost<undefined>('/hymn/create', body, token);
}
