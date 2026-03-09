/** Llamadas HTTP para crear y editar himnos (requiere JWT) */

import { apiPost, apiPut } from './apiClient';

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

interface EditHymnBody {
  title: string;
  content: HymnContent;
  user: {
    email: string;
    name: string;
  };
}

export async function editHymn(id: number, body: EditHymnBody, token: string): Promise<void> {
  await apiPut<undefined>(`/hymn/${String(id)}`, body, token);
}
