/**
 * Hook para gestionar el tema (claro/oscuro) con persistencia en localStorage.
 * Aplica/retira la clase 'dark' en document.documentElement para activar
 * las variantes dark: de Tailwind CSS.
 * Sincroniza lectura inicial desde localStorage o preferencia del sistema.
 */

import { useState, useCallback, useEffect } from 'react';
import { readTheme, writeTheme } from '../storage/themeStorage';
import type { Theme } from '../storage/themeStorage';

export interface UseThemeReturn {
  /** Tema actual: 'light' | 'dark' */
  theme: Theme;
  /** Si el modo oscuro está activo */
  isDark: boolean;
  /** Alterna entre modo claro y oscuro */
  toggle: () => void;
  /** Establece el tema explícitamente */
  setTheme: (theme: Theme) => void;
}

/**
 * Aplica la clase 'dark' al elemento raíz del documento según el tema.
 */
function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return;

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(() => {
    const initial = readTheme();
    // Aplicar inmediatamente para evitar flash de tema incorrecto
    applyThemeToDocument(initial);
    return initial;
  });

  // Sincronizar con document.documentElement cuando el tema cambie
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    writeTheme(newTheme);
    applyThemeToDocument(newTheme);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      writeTheme(next);
      applyThemeToDocument(next);
      return next;
    });
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggle,
    setTheme,
  };
}
