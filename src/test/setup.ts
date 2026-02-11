/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';

// Suprimir warnings de React Router sobre flags de v7 en tests
// (no son errores, son advertencias de migración futura)
const originalConsoleError = console.error.bind(console);
const originalConsoleWarn = console.warn.bind(console);

beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    const msg = args[0];
    if (
      typeof msg === 'string' &&
      (msg.includes('React Router Future Flag Warning') ||
        msg.includes('v7_startTransition') ||
        msg.includes('v7_relativeSplatPath'))
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };

  // Suprimir el warning de act() que React muestra en modo StrictMode
  // cuando hay actualizaciones de estado asíncronas. Los tests usan
  // waitFor correctamente, el warning es un falso positivo conocido.
  console.error = (...args: unknown[]) => {
    const msg = args[0];
    if (
      typeof msg === 'string' &&
      msg.includes('not wrapped in act(...)')
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});
