/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Declaración de módulos SVG para importación como URL
declare module '*.svg' {
  const src: string;
  export default src;
}
