/**
 * Servicio de persistencia para el tema (claro/oscuro).
 * Usa localStorage con clave 'himnario:theme'.
 * Si no hay preferencia guardada, usa la preferencia del sistema.
 * Sin uso de `any` — todo tipado estrictamente.
 */

export const THEME_KEY = 'himnario:theme' as const;

export type Theme = 'light' | 'dark';

/**
 * Detecta la preferencia de tema del sistema operativo.
 * Retorna 'dark' si el sistema está en modo oscuro, 'light' en caso contrario.
 */
export function getSystemTheme(): Theme {
  try {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
  } catch {
    // matchMedia puede no estar disponible en entornos sin window
  }
  return 'light';
}

/**
 * Lee el tema guardado en localStorage.
 * Si no hay valor guardado o no es válido, usa la preferencia del sistema.
 */
export function readTheme(): Theme {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'light' || raw === 'dark') {
      return raw;
    }
  } catch {
    // localStorage puede no estar disponible (SSR, cookies bloqueadas, etc.)
  }
  return getSystemTheme();
}

/**
 * Guarda el tema en localStorage.
 */
export function writeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Silenciar errores de localStorage (modo privado, cuota excedida, etc.)
  }
}
