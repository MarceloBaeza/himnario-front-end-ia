import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { THEME_KEY } from '../../storage/themeStorage';

/**
 * Helper para mockear matchMedia simulando preferencia del sistema.
 */
function mockMatchMedia(prefersDark: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: prefersDark && query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    // Limpiar clase dark antes de cada test
    document.documentElement.classList.remove('dark');
    // Por defecto simular sistema en modo claro
    mockMatchMedia(false);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.restoreAllMocks();
  });

  describe('inicialización', () => {
    it('inicia en modo claro cuando el sistema prefiere claro y no hay preferencia guardada', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('inicia en modo oscuro cuando el sistema prefiere oscuro y no hay preferencia guardada', () => {
      mockMatchMedia(true);
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('inicia con la preferencia guardada en localStorage (dark) ignorando el sistema', () => {
      localStorage.setItem(THEME_KEY, 'dark');
      mockMatchMedia(false); // sistema en claro

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('inicia con la preferencia guardada en localStorage (light) ignorando el sistema', () => {
      localStorage.setItem(THEME_KEY, 'light');
      mockMatchMedia(true); // sistema en oscuro

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });
  });

  describe('document.documentElement class', () => {
    it('agrega la clase "dark" al elemento raíz cuando el tema es oscuro', () => {
      localStorage.setItem(THEME_KEY, 'dark');
      renderHook(() => useTheme());

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('no agrega la clase "dark" cuando el tema es claro', () => {
      localStorage.setItem(THEME_KEY, 'light');
      renderHook(() => useTheme());

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('toggle', () => {
    it('alterna de claro a oscuro al llamar toggle', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');

      act(() => {
        result.current.toggle();
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('alterna de oscuro a claro al llamar toggle', () => {
      localStorage.setItem(THEME_KEY, 'dark');
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');

      act(() => {
        result.current.toggle();
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('persiste la preferencia en localStorage al hacer toggle', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggle();
      });

      expect(localStorage.getItem(THEME_KEY)).toBe('dark');

      act(() => {
        result.current.toggle();
      });

      expect(localStorage.getItem(THEME_KEY)).toBe('light');
    });

    it('actualiza la clase del documento al hacer toggle', () => {
      const { result } = renderHook(() => useTheme());

      expect(document.documentElement.classList.contains('dark')).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('setTheme', () => {
    it('establece el tema a "dark" explícitamente', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(localStorage.getItem(THEME_KEY)).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('establece el tema a "light" explícitamente', () => {
      localStorage.setItem(THEME_KEY, 'dark');
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
      expect(localStorage.getItem(THEME_KEY)).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('es idempotente: setTheme con el mismo valor no produce cambios incorrectos', () => {
      localStorage.setItem(THEME_KEY, 'dark');
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});
