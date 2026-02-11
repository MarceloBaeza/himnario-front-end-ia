/**
 * Utilidades de texto para búsqueda de himnos.
 * Implementa normalización de diacríticos y búsqueda fuzzy/parcial.
 */

/**
 * Normaliza un texto para búsqueda:
 * - Convierte a minúsculas
 * - Elimina diacríticos/acentos (á->a, é->e, ñ->n, etc.)
 * - Elimina espacios extras
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina marcas diacríticas
    .trim();
}

/**
 * Búsqueda fuzzy/parcial: verifica si `query` aparece (parcialmente)
 * en `target`. Normaliza ambos para ignorar tildes y mayúsculas.
 *
 * Estrategia: substring match después de normalizar.
 * Permite: "senor" -> "señor", "gracia" -> "Sublime Gracia"
 *
 * @returns true si el query normalizado está contenido en el target normalizado
 */
export function fuzzyMatch(query: string, target: string): boolean {
  const normalizedQuery = normalizeText(query);
  const normalizedTarget = normalizeText(target);

  if (normalizedQuery.length === 0) return true;

  return normalizedTarget.includes(normalizedQuery);
}

/**
 * Puntuación de relevancia para ordenar resultados fuzzy.
 * Mayor puntuación = mejor match.
 *
 * @returns número entre 0 y 3 (0 = sin match, 3 = match exacto)
 */
export function fuzzyScore(query: string, target: string): number {
  const normalizedQuery = normalizeText(query);
  const normalizedTarget = normalizeText(target);

  if (normalizedQuery.length === 0) return 1;
  if (!normalizedTarget.includes(normalizedQuery)) return 0;

  // Match exacto
  if (normalizedTarget === normalizedQuery) return 3;
  // Empieza con el query
  if (normalizedTarget.startsWith(normalizedQuery)) return 2;
  // Contiene el query
  return 1;
}
