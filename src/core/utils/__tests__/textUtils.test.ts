import { describe, it, expect } from 'vitest';
import { normalizeText, fuzzyMatch, fuzzyScore } from '../textUtils';

describe('normalizeText', () => {
  it('convierte a minúsculas', () => {
    expect(normalizeText('SEÑOR')).toBe('senor');
    expect(normalizeText('Grande')).toBe('grande');
  });

  it('elimina diacríticos/acentos', () => {
    expect(normalizeText('Señor')).toBe('senor');
    expect(normalizeText('canción')).toBe('cancion');
    expect(normalizeText('fidelidad')).toBe('fidelidad');
    expect(normalizeText('Jesús')).toBe('jesus');
    expect(normalizeText('grácil')).toBe('gracil');
  });

  it('elimina espacios al inicio y al final', () => {
    expect(normalizeText('  himno  ')).toBe('himno');
  });

  it('maneja cadenas vacías', () => {
    expect(normalizeText('')).toBe('');
  });

  it('normaliza múltiples diacríticos combinados', () => {
    expect(normalizeText('álabanza ñoño')).toBe('alabanza nono');
  });
});

describe('fuzzyMatch', () => {
  it('retorna true para match exacto', () => {
    expect(fuzzyMatch('sublime gracia', 'Sublime Gracia')).toBe(true);
  });

  it('retorna true para match parcial (substring)', () => {
    expect(fuzzyMatch('gracia', 'Sublime Gracia')).toBe(true);
    expect(fuzzyMatch('sublime', 'Sublime Gracia')).toBe(true);
  });

  it('ignora tildes: "senor" encuentra "Señor"', () => {
    expect(fuzzyMatch('senor', 'Señor omnipotente')).toBe(true);
  });

  it('ignora tildes: "jesus" encuentra "Jesús"', () => {
    expect(fuzzyMatch('jesus', 'Jesús')).toBe(true);
  });

  it('retorna false cuando no hay match', () => {
    expect(fuzzyMatch('xyz', 'Sublime Gracia')).toBe(false);
  });

  it('retorna true para query vacío (match de todo)', () => {
    expect(fuzzyMatch('', 'cualquier himno')).toBe(true);
  });

  it('es case-insensitive', () => {
    expect(fuzzyMatch('GRANDE', 'Grande Es Tu Fidelidad')).toBe(true);
    expect(fuzzyMatch('grande', 'GRANDE ES TU FIDELIDAD')).toBe(true);
  });

  it('busca en el medio del título', () => {
    expect(fuzzyMatch('fidelidad', 'Grande Es Tu Fidelidad')).toBe(true);
  });

  it('busca "castillo" en título completo', () => {
    expect(fuzzyMatch('castillo', 'Castillo Fuerte Es Nuestro Dios')).toBe(true);
  });
});

describe('fuzzyScore', () => {
  it('retorna 3 para match exacto', () => {
    expect(fuzzyScore('sublime gracia', 'Sublime Gracia')).toBe(3);
  });

  it('retorna 2 cuando el target empieza con el query', () => {
    expect(fuzzyScore('sublime', 'Sublime Gracia')).toBe(2);
  });

  it('retorna 1 cuando el query está contenido en el target', () => {
    expect(fuzzyScore('gracia', 'Sublime Gracia')).toBe(1);
  });

  it('retorna 0 cuando no hay match', () => {
    expect(fuzzyScore('xyz', 'Sublime Gracia')).toBe(0);
  });

  it('retorna 1 para query vacío', () => {
    expect(fuzzyScore('', 'cualquier titulo')).toBe(1);
  });
});
