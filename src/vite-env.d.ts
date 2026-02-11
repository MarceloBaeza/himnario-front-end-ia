/// <reference types="vite/client" />

// Declaración de módulos SVG para importación como URL
declare module '*.svg' {
  const src: string;
  export default src;
}
