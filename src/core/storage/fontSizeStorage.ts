/**
 * Servicio de persistencia para el tamaño de fuente.
 * Usa localStorage con clamp para garantizar límites min/max.
 * Sin uso de `any` — todo tipado estrictamente.
 */

export const FONT_SIZE_KEY = 'himnario:fontSize' as const;
export const FONT_SIZE_MIN = 14;
export const FONT_SIZE_MAX = 26;
export const FONT_SIZE_DEFAULT = 18;
export const FONT_SIZE_STEP = 2;

/**
 * Restringe un número al rango [min, max].
 */
export function clampFontSize(value: number): number {
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, value));
}

/**
 * Lee el tamaño de fuente desde localStorage.
 * Retorna el valor por defecto si no existe o si el valor guardado
 * no es un número válido dentro del rango permitido.
 */
export function readFontSize(): number {
  try {
    const raw = localStorage.getItem(FONT_SIZE_KEY);
    if (raw === null) return FONT_SIZE_DEFAULT;

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return FONT_SIZE_DEFAULT;

    return clampFontSize(parsed);
  } catch {
    // localStorage puede no estar disponible (SSR, cookies bloqueadas, etc.)
    return FONT_SIZE_DEFAULT;
  }
}

/**
 * Guarda el tamaño de fuente en localStorage.
 * Aplica clamp antes de guardar para garantizar valores válidos.
 */
export function writeFontSize(size: number): void {
  try {
    const clamped = clampFontSize(size);
    localStorage.setItem(FONT_SIZE_KEY, String(clamped));
  } catch {
    // Silenciar errores de localStorage (modo privado, cuota excedida, etc.)
  }
}
