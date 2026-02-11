# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server on localhost:5173
npm run build        # tsc + vite build (type-checks then bundles)
npm run lint         # ESLint strict mode, zero warnings allowed
npm run test         # Vitest single run
npm run test:watch   # Vitest watch mode
npm run test -- src/core/utils/__tests__/textUtils.test.ts  # Run a single test file
```

## Architecture

Himnario is a static hymnal web app for "Iglesia Bautista Omega". **Phase 1 has no backend** — hymns are JSON files in `src/assets/himnos/` served as static assets.

### Data flow

`src/assets/himnos/index.json` is the mandatory hymn manifest (browser can't list directories). Each hymn has its own JSON file (e.g., `001-sublime-gracia.json`). The `AssetsHymnRepository` fetches these and validates with Zod schemas before returning typed data.

### Repository pattern

`IHymnRepository` (interface) → `AssetsHymnRepository` (static files implementation). When a backend is added, only a new repository implementation is needed — UI layer stays unchanged. The singleton `hymnRepository` in `AssetsHymnRepository.ts` is what hooks consume.

### Module boundaries

- **`src/core/`** — Domain types (`Hymn`, `HymnIndexEntry`, `LoadingState`), repository interface+implementation, Zod schemas, text utilities (`normalizeText`, `fuzzyMatch`), font size storage, and shared hooks (`useDebouncedValue`, `useFontSize`).
- **`src/features/hymns/`** — Feature-specific hooks (`useHymnList`, `useHymnDetail`), page components, and UI components (SearchInput, HymnCard, FontSizeControl).
- **`src/app/`** — React Router config and layout (Header + AppLayout with Outlet).
- **`src/components/ui/`** — Shared presentational components (EmptyState, ErrorMessage, LoadingSpinner, Logo).

### Routes

- `/` — HymnListPage (search + alphabetical list)
- `/hymn/:id` — HymnDetailPage (lyrics + font size controls)
- `*` — NotFoundPage

### Search

`normalizeText()` lowercases and strips diacritics via `String.normalize('NFD')`. `fuzzyMatch()` does substring match on normalized strings, so "senor" finds "Señor". Search only matches on title, not content.

### Font size persistence

Stored in localStorage under key `himnario:fontSize`. Clamped to 14–26px range on both read and write. Default is 18px, step is 2px.

### Theme persistence (dark mode)

Stored in localStorage under key `himnario:theme`. Valid values are `'light'` and `'dark'`. When no preference is saved, the default is derived from `window.matchMedia('(prefers-color-scheme: dark)')` (i.e., the OS/browser system preference). The `useTheme` hook manages the state and applies/removes the `'dark'` class on `document.documentElement` so Tailwind's `darkMode: 'class'` strategy activates all `dark:` variants. The toggle button (sun/moon icon) lives in the `Header` component. Both the storage service (`themeStorage.ts`) and the hook (`useTheme.ts`) follow the same patterns as `fontSizeStorage.ts` / `useFontSize.ts`.

## Key constraints

- **Zero `any`** — ESLint enforces `no-explicit-any` and all `no-unsafe-*` rules. Use `unknown` + Zod `safeParse` or type guards for untyped data.
- **TypeScript strict mode** — Includes `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, and all strict checks.
- **ESLint has dual config** — App code uses `tsconfig.app.json` (excludes tests); test files use `tsconfig.test.json` (has `vitest/globals` types, relaxes `unbound-method`).
- **Path alias** — `@/` maps to `./src/` (configured in both vite.config.ts and tsconfig).
- **Tailwind palette** — Custom `primary` (granate/red, main: `primary-700`) and `neutral` scales in `tailwind.config.js`.
- **Accessibility required** — Keyboard navigation, visible focus, aria-labels, AA contrast.

## Adding a hymn

1. Create `src/assets/himnos/<id>.json` with fields: `id`, `title`, `content` (required), `author`, `createdAt` (optional).
2. Add an entry to `src/assets/himnos/index.json` with `id`, `title`, `file`, and optional `author`.
