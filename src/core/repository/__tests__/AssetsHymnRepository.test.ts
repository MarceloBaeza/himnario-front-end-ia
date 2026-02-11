import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssetsHymnRepository } from '../AssetsHymnRepository';

/** Datos de prueba para el índice */
const mockIndex = [
  { id: 'h001', title: 'Himno Uno', author: 'Autor 1', file: 'h001.json' },
  { id: 'h002', title: 'Himno Dos', file: 'h002.json' },
];

/** Datos de prueba para un himno completo */
const mockHymn = {
  id: 'h001',
  title: 'Himno Uno',
  author: 'Autor 1',
  content: 'Verso 1\nVerso 2',
  createdAt: '2024-01-15T00:00:00.000Z',
};

/** Himno sin author ni createdAt (campos opcionales) */
const mockHymnMinimal = {
  id: 'h002',
  title: 'Himno Dos',
  content: 'Solo una línea',
};

/**
 * Crea un mock de fetch tipado correctamente.
 * Usa `unknown as typeof fetch` para evitar el problema de solapamiento de tipos
 * manteniendo el contrato real de la interfaz fetch del navegador.
 */
function createMockFetch(responses: Record<string, unknown>): typeof fetch {
  const mockFn = vi.fn((url: string) => {
    const key = Object.keys(responses).find((k) => url.includes(k));
    if (key === undefined) {
      const notFoundResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve(null),
      };
      return Promise.resolve(notFoundResponse as unknown as Response);
    }
    const successResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(responses[key]),
    };
    return Promise.resolve(successResponse as unknown as Response);
  });
  return mockFn as unknown as typeof fetch;
}

describe('AssetsHymnRepository', () => {
  let repository: AssetsHymnRepository;

  beforeEach(() => {
    repository = new AssetsHymnRepository('/assets/himnos');
  });

  describe('getIndex', () => {
    it('retorna el índice correctamente parseado', async () => {
      global.fetch = createMockFetch({ 'index.json': mockIndex });

      const index = await repository.getIndex();

      expect(index).toHaveLength(2);
      expect(index[0]).toEqual(mockIndex[0]);
      expect(index[1]).toEqual(mockIndex[1]);
    });

    it('lanza error si el fetch falla (404)', async () => {
      global.fetch = vi.fn(() => {
        const notFoundResponse = {
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.resolve(null),
        };
        return Promise.resolve(notFoundResponse as unknown as Response);
      }) as unknown as typeof fetch;

      await expect(repository.getIndex()).rejects.toThrow('404');
    });

    it('lanza error si el JSON del índice tiene formato inválido', async () => {
      global.fetch = createMockFetch({ 'index.json': { invalid: true } });

      await expect(repository.getIndex()).rejects.toThrow('formato inválido');
    });

    it('lanza error si el índice tiene entradas sin title', async () => {
      const badIndex = [{ id: 'h001', file: 'h001.json' }]; // falta title
      global.fetch = createMockFetch({ 'index.json': badIndex });

      await expect(repository.getIndex()).rejects.toThrow('formato inválido');
    });
  });

  describe('getById', () => {
    it('retorna un himno completo correctamente', async () => {
      global.fetch = createMockFetch({
        'index.json': mockIndex,
        'h001.json': mockHymn,
      });

      const hymn = await repository.getById('h001');

      expect(hymn.id).toBe('h001');
      expect(hymn.title).toBe('Himno Uno');
      expect(hymn.author).toBe('Autor 1');
      expect(hymn.content).toBe('Verso 1\nVerso 2');
    });

    it('retorna himno sin campos opcionales (author, createdAt)', async () => {
      global.fetch = createMockFetch({
        'index.json': mockIndex,
        'h002.json': mockHymnMinimal,
      });

      const hymn = await repository.getById('h002');

      expect(hymn.id).toBe('h002');
      expect(hymn.author).toBeUndefined();
      expect(hymn.createdAt).toBeUndefined();
    });

    it('lanza error si el id no existe en el índice', async () => {
      global.fetch = createMockFetch({ 'index.json': mockIndex });

      await expect(repository.getById('no-existe')).rejects.toThrow('no encontrado');
    });

    it('lanza error si el JSON del himno tiene formato inválido', async () => {
      global.fetch = createMockFetch({
        'index.json': mockIndex,
        'h001.json': { invalid: 'data' }, // sin content
      });

      await expect(repository.getById('h001')).rejects.toThrow('formato inválido');
    });
  });
});
