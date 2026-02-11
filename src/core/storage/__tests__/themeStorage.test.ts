import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  readTheme,
  writeTheme,
  getSystemTheme,
  THEME_KEY,
} from '../themeStorage';

describe('getSystemTheme', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retorna "dark" cuando el sistema prefiere modo oscuro', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(getSystemTheme()).toBe('dark');
  });

  it('retorna "light" cuando el sistema prefiere modo claro', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(getSystemTheme()).toBe('light');
  });
});

describe('readTheme / writeTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    // Por defecto, simular sistema en modo claro para tests predecibles
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('retorna la preferencia del sistema (light) cuando localStorage está vacío', () => {
    expect(readTheme()).toBe('light');
  });

  it('retorna "dark" desde el sistema cuando localStorage está vacío y sistema es oscuro', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(readTheme()).toBe('dark');
  });

  it('retorna "light" cuando está guardado en localStorage', () => {
    writeTheme('light');
    expect(readTheme()).toBe('light');
  });

  it('retorna "dark" cuando está guardado en localStorage', () => {
    writeTheme('dark');
    expect(readTheme()).toBe('dark');
  });

  it('ignora valores inválidos en localStorage y usa la preferencia del sistema', () => {
    localStorage.setItem(THEME_KEY, 'invalid-value');
    expect(readTheme()).toBe('light');
  });

  it('ignora valores numéricos en localStorage y usa la preferencia del sistema', () => {
    localStorage.setItem(THEME_KEY, '1');
    expect(readTheme()).toBe('light');
  });

  it('writeTheme persiste el valor correcto en localStorage', () => {
    writeTheme('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');

    writeTheme('light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
  });

  it('el ciclo write/read es consistente', () => {
    writeTheme('dark');
    expect(readTheme()).toBe('dark');

    writeTheme('light');
    expect(readTheme()).toBe('light');
  });
});
