import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  clampFontSize,
  readFontSize,
  writeFontSize,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_KEY,
} from '../fontSizeStorage';

describe('clampFontSize', () => {
  it('retorna el valor cuando está dentro del rango', () => {
    expect(clampFontSize(18)).toBe(18);
    expect(clampFontSize(14)).toBe(14);
    expect(clampFontSize(26)).toBe(26);
  });

  it('aplica el mínimo cuando el valor es muy pequeño', () => {
    expect(clampFontSize(10)).toBe(FONT_SIZE_MIN);
    expect(clampFontSize(0)).toBe(FONT_SIZE_MIN);
    expect(clampFontSize(-5)).toBe(FONT_SIZE_MIN);
  });

  it('aplica el máximo cuando el valor es muy grande', () => {
    expect(clampFontSize(50)).toBe(FONT_SIZE_MAX);
    expect(clampFontSize(100)).toBe(FONT_SIZE_MAX);
  });

  it('acepta exactamente el mínimo y máximo', () => {
    expect(clampFontSize(FONT_SIZE_MIN)).toBe(FONT_SIZE_MIN);
    expect(clampFontSize(FONT_SIZE_MAX)).toBe(FONT_SIZE_MAX);
  });
});

describe('readFontSize / writeFontSize', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('retorna el valor por defecto cuando localStorage está vacío', () => {
    expect(readFontSize()).toBe(FONT_SIZE_DEFAULT);
  });

  it('retorna el valor guardado correctamente', () => {
    writeFontSize(20);
    expect(readFontSize()).toBe(20);
  });

  it('aplica clamp al leer valores fuera de rango guardados manualmente', () => {
    localStorage.setItem(FONT_SIZE_KEY, '100');
    expect(readFontSize()).toBe(FONT_SIZE_MAX);

    localStorage.setItem(FONT_SIZE_KEY, '5');
    expect(readFontSize()).toBe(FONT_SIZE_MIN);
  });

  it('retorna valor por defecto si el valor en localStorage no es un número', () => {
    localStorage.setItem(FONT_SIZE_KEY, 'abc');
    expect(readFontSize()).toBe(FONT_SIZE_DEFAULT);
  });

  it('retorna valor por defecto si el valor en localStorage es NaN', () => {
    localStorage.setItem(FONT_SIZE_KEY, 'NaN');
    expect(readFontSize()).toBe(FONT_SIZE_DEFAULT);
  });

  it('writeFontSize aplica clamp antes de guardar', () => {
    writeFontSize(100);
    expect(localStorage.getItem(FONT_SIZE_KEY)).toBe(String(FONT_SIZE_MAX));

    writeFontSize(0);
    expect(localStorage.getItem(FONT_SIZE_KEY)).toBe(String(FONT_SIZE_MIN));
  });

  it('el ciclo write/read es consistente', () => {
    const sizes = [14, 16, 18, 20, 22, 24, 26];
    for (const size of sizes) {
      writeFontSize(size);
      expect(readFontSize()).toBe(size);
    }
  });
});
