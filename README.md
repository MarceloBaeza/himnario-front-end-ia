# Himnario - Iglesia Bautista Omega

Aplicación web de himnario digital para Iglesia Bautista Omega. Construida con React 19+, TypeScript estricto y Tailwind CSS.

## Requisitos

- Node.js 18+
- npm 9+

## Cómo correr

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build de producción
npm run build

# Correr linter
npm run lint

# Correr tests
npm run test

# Formatear código (opcional)
npm run format
```

## Estructura del proyecto

```
src/
  app/
    layout/
      AppLayout.tsx     - Layout principal con Header y Outlet
      Header.tsx        - Header con logo, nombre y navegación
    router.tsx          - Configuración de React Router v6
  assets/
    himnos/
      index.json        - Índice obligatorio de todos los himnos
      001-sublime-gracia.json
      002-castillo-fuerte.json
      003-grande-es-tu-fidelidad.json
      004-cuan-grande-es-el.json
      005-santo-santo-santo.json
    utils/
      logo.svg          - Logo SVG de Iglesia Bautista Omega
  components/
    ui/
      EmptyState.tsx    - Estado vacío (sin resultados)
      ErrorMessage.tsx  - Mensaje de error con retry
      LoadingSpinner.tsx - Spinner de carga accesible
      Logo.tsx          - Componente del logo
  core/
    hooks/
      useDebouncedValue.ts - Debounce genérico tipado
      useFontSize.ts       - Control de tamaño de fuente con localStorage
    repository/
      IHymnRepository.ts       - Interfaz del repositorio (abstracción)
      AssetsHymnRepository.ts  - Implementación con assets estáticos
      schemas.ts               - Schemas Zod para validación
    storage/
      fontSizeStorage.ts  - Persistencia de tamaño de fuente en localStorage
    types/
      hymn.ts             - Tipos del dominio (Hymn, HymnIndexEntry, etc.)
    utils/
      textUtils.ts        - normalizeText, fuzzyMatch, fuzzyScore
  features/
    hymns/
      __tests__/
        HymnListPage.test.tsx   - Tests de UI para la lista
        HymnDetailPage.test.tsx - Tests de UI para el detalle
      components/
        FontSizeControl.tsx  - Botones A-/A+/Reset
        HymnCard.tsx         - Tarjeta de himno en la lista
        SearchInput.tsx      - Input de búsqueda con clear button
      hooks/
        useHymnList.ts    - Lógica de carga y filtrado de la lista
        useHymnDetail.ts  - Lógica de carga del detalle
      pages/
        HymnDetailPage.tsx - Página /hymn/:id
        HymnListPage.tsx   - Página / (inicio)
        NotFoundPage.tsx   - Página 404
  styles/
    global.css            - Estilos globales y Tailwind
  test/
    setup.ts              - Configuración de Testing Library
  main.tsx                - Punto de entrada de la aplicación
```

## Cómo agregar un himno

1. Crea el archivo JSON del himno en `src/assets/himnos/`:

```json
// src/assets/himnos/006-mi-nuevo-himno.json
{
  "id": "006-mi-nuevo-himno",
  "title": "Mi Nuevo Himno",
  "author": "Nombre del Autor",
  "content": "Primera estrofa línea 1\nPrimera estrofa línea 2\n\nSegunda estrofa línea 1\nSegunda estrofa línea 2",
  "createdAt": "2024-12-01T00:00:00.000Z"
}
```

2. Agrega una entrada en `src/assets/himnos/index.json`:

```json
[
  // ... entradas existentes ...
  {
    "id": "006-mi-nuevo-himno",
    "title": "Mi Nuevo Himno",
    "author": "Nombre del Autor",
    "file": "006-mi-nuevo-himno.json"
  }
]
```

**Notas sobre el formato del contenido (`content`):**
- Usa `\n` para saltos de línea dentro de una estrofa
- Usa `\n\n` para separar estrofas
- El campo `author` es opcional
- El campo `createdAt` es opcional (formato ISO 8601)

## Decisiones técnicas

### Por que index.json

En el navegador no es posible listar directorios en tiempo de ejecución. El archivo `index.json` actúa como un manifiesto que describe todos los himnos disponibles. Esto permite:
- Cargar la lista de himnos sin conocer los nombres de archivo a priori
- Agregar himnos fácilmente (solo crear el JSON + actualizar el índice)
- Preparar la estructura para migrar a una API REST en el futuro (la interfaz `IHymnRepository` ya tiene la abstracción)

### Estrategia de búsqueda

La búsqueda es fuzzy/parcial solo sobre el campo `title`, con las siguientes características:

1. **Normalización**: `normalizeText()` convierte a minúsculas y elimina diacríticos usando `String.normalize('NFD')` + regex de marcas Unicode. Esto permite buscar "senor" y encontrar "Señor".

2. **Matching**: `fuzzyMatch()` verifica si el query normalizado es un substring del target normalizado. Es la estrategia más intuitiva para un himnario: buscar "gracia" encuentra "Sublime Gracia".

3. **Debounce**: `useDebouncedValue(query, 300ms)` evita filtrar en cada keystroke.

Se optó por substring match en lugar de algoritmos más complejos (Levenshtein, trigrams) porque:
- Para un himnario el usuario conoce aproximadamente el título
- Agrega menor complejidad y bundle size
- Es suficientemente flexible gracias a la normalización de tildes

### Persistencia del tamaño de fuente

El tamaño de fuente se persiste en `localStorage` con la key `himnario:fontSize`. Decisiones:
- Se persiste globalmente (no por himno) para consistencia visual
- Se aplica clamp al leer y al escribir para garantizar valores válidos (14-26px)
- El módulo `fontSizeStorage.ts` maneja silenciosamente errores de localStorage (modo privado, cuota excedida)

### Sin `any`

El proyecto tiene prohibición absoluta de `any`. Se usa:
- `unknown` + Zod para parsear JSON de los assets
- Type guards implícitos de Zod (`safeParse`)
- Discriminated unions para estados (LoadingState)

## Scripts

```bash
npm run dev       # Servidor de desarrollo Vite en localhost:5173
npm run build     # Build de producción (tsc + vite build)
npm run lint      # ESLint con reglas estrictas de TypeScript
npm run test      # Vitest en modo run (CI)
npm run test:watch # Vitest en modo watch (desarrollo)
npm run format    # Prettier sobre src/**/*.{ts,tsx,css}
```
