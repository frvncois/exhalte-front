# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Development server (Vite)
npm run build        # Type-check + build for production
npm run build-only   # Build only (no type check)
npm run type-check   # TypeScript validation via vue-tsc
npm run preview      # Preview production build
```

No test runner is configured.

## Architecture

**Vue 3 + TypeScript + Vite** portfolio/project showcase site. The defining characteristic is its animation-first architecture centered on fluid page transitions.

### App Load Flow

`App.vue` orchestrates three sequential phases:
1. `AppLoad` — Animated SVG splash screen
2. `RouteChange` — Transition overlay used between route changes
3. `RouterView` — Page content (rendered only after `viewReady` flag)

### Transition System (`src/transitions/`)

The core complexity lives here. `projectTransition.ts` implements a state machine for project card → single-project-page transitions:
- Captures DOM clones of grid items (cover, title, text) at click time
- Animates clones into position using GSAP clipPath/transform
- Reverse transition animates back to the grid card position
- Router guards in `src/router/index.ts` trigger callbacks registered by components

### Route-Based Theming

Routes declare `meta: { hasHeader: true }` and the router's `beforeEach`/`afterEach` guards:
- Apply theme classes to `<body>` using the `themes` map in `src/transitions/themes.ts`
- Handle header-to-header navigation (skips animation when both routes have headers)

### State Management

Pinia is used minimally:
- `useProjectStore()` — tracks active project content type (`'video' | 'gallery'`) for `SingleView`

### Component Organization

```
components/
  shared/     # Header, footer, project card (used across pages)
  content/    # Content containers (1-col, 2-col, gallery, video)
  grid/       # GridProjects (home page project grid)
  single/     # Single project UI (hero, nav)
  transition/ # AppLoad splash, RouteTransition overlay
```

### Data Layer (`src/api/strapi.ts`)

All content is fetched from a **Strapi CMS** backend. Two environment variables are required:
- `VITE_STRAPI_URL` — base URL of the Strapi instance
- `VITE_STRAPI_TOKEN` — Bearer token for authenticated requests

The three fetch functions (`getProjects`, `getService`, `getContact`) map to Strapi collection types. Project slugs are derived at runtime via `slugify(title)` — there is no slug field in Strapi; routing depends entirely on this function staying stable.

### Routes

| Path | Name | Theme |
|------|------|-------|
| `/` | `home` | hasHeader |
| `/projects/:slug` | `single` | — |
| `/services` | `services` | hasHeader |
| `/contact` | `contact` | hasHeader |

### Key Libraries

- **GSAP** — All animations (timelines, stagger, clipPath, transform)
- **Lenis** (`src/lib/lenis.ts`) — Smooth scroll instance, shared across components
- **Vue Router** — Client-side routing with navigation guards for transitions
- **Pinia** — Minimal global state

### Styling

- `src/assets/global.css` — CSS custom properties for colors, type scale, and theme classes (`theme-pink`, etc.)
- Most components use `<style scoped>`
- Theme transitions use CSS `transition` on color/background (0.6s ease)
- Path alias `@` maps to `src/`
