/**
 * Parser de contenido de himno desde texto libre a JSONB estructurado.
 *
 * Formato esperado del textarea:
 *   VERSO 1:
 *   Línea uno del verso
 *   Línea dos del verso
 *
 *   CORO:
 *   Estribillo del himno
 *
 *   VERSO 2:
 *   ...
 *
 * - Los marcadores son case-insensitive: "VERSO 1:", "verso 1:", "Verso 1:" son equivalentes.
 * - El número de verso puede ser cualquier entero positivo.
 * - El coro es opcional.
 * - Las líneas vacías entre secciones se ignoran.
 */

import type { HymnContent, HymnVerse } from '../api/hymnApi';

const VERSO_REGEX = /^verso\s+(\d+)\s*:?\s*$/i;
const CORO_REGEX = /^coro\s*:?\s*$/i;

export function parseHymnContent(text: string): HymnContent {
  const verses: HymnVerse[] = [];
  let chorus: string | undefined;

  type CurrentSection =
    | { type: 'verse'; number: number }
    | { type: 'chorus' }
    | null;

  let currentSection: CurrentSection = null;
  let currentLines: string[] = [];

  const flushSection = () => {
    if (currentSection === null) return;
    const trimmedLines = currentLines
      .map((l) => l.trimEnd())
      .filter((l) => l.length > 0);
    if (trimmedLines.length === 0) return;

    if (currentSection.type === 'verse') {
      verses.push({ number: currentSection.number, lines: trimmedLines });
    } else {
      chorus = trimmedLines.join('\n');
    }
  };

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    const versoMatch = VERSO_REGEX.exec(trimmed);
    const coroMatch = CORO_REGEX.exec(trimmed);

    if (versoMatch !== null) {
      flushSection();
      currentSection = { type: 'verse', number: parseInt(versoMatch[1] ?? '1', 10) };
      currentLines = [];
    } else if (coroMatch !== null) {
      flushSection();
      currentSection = { type: 'chorus' };
      currentLines = [];
    } else if (currentSection !== null) {
      currentLines.push(line);
    }
  }

  flushSection();

  return { verses, chorus };
}

/** Valida que el contenido parseado tenga al menos un verso o el coro */
export function isValidContent(content: HymnContent): boolean {
  return content.verses.length > 0 || content.chorus !== undefined;
}
