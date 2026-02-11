/**
 * Hook para gestionar el tamaño de fuente con persistencia en localStorage.
 * Aplica clamp automático dentro de los límites definidos.
 * Sincroniza lectura inicial desde localStorage.
 */

import { useState, useCallback } from 'react';
import {
  readFontSize,
  writeFontSize,
  clampFontSize,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_STEP,
} from '../storage/fontSizeStorage';

export interface UseFontSizeReturn {
  /** Tamaño de fuente actual en píxeles */
  fontSize: number;
  /** Incrementa el tamaño de fuente en un paso */
  increase: () => void;
  /** Decrementa el tamaño de fuente en un paso */
  decrease: () => void;
  /** Restablece al tamaño por defecto */
  reset: () => void;
  /** Si el tamaño está en el mínimo */
  isAtMin: boolean;
  /** Si el tamaño está en el máximo */
  isAtMax: boolean;
  /** Mínimo permitido */
  min: number;
  /** Máximo permitido */
  max: number;
}

export function useFontSize(): UseFontSizeReturn {
  const [fontSize, setFontSize] = useState<number>(() => readFontSize());

  const updateSize = useCallback((newSize: number) => {
    const clamped = clampFontSize(newSize);
    setFontSize(clamped);
    writeFontSize(clamped);
  }, []);

  const increase = useCallback(() => {
    setFontSize((prev) => {
      const next = clampFontSize(prev + FONT_SIZE_STEP);
      writeFontSize(next);
      return next;
    });
  }, []);

  const decrease = useCallback(() => {
    setFontSize((prev) => {
      const next = clampFontSize(prev - FONT_SIZE_STEP);
      writeFontSize(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    updateSize(FONT_SIZE_DEFAULT);
  }, [updateSize]);

  return {
    fontSize,
    increase,
    decrease,
    reset,
    isAtMin: fontSize <= FONT_SIZE_MIN,
    isAtMax: fontSize >= FONT_SIZE_MAX,
    min: FONT_SIZE_MIN,
    max: FONT_SIZE_MAX,
  };
}
