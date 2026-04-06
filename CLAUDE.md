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

No test runner is configured. Node `^20.19.0 || >=22.12.0` required.

## Architecture

**Vue 3 + TypeScript + Vite** portfolio/project showcase site. The defining characteristic is its animation-first architecture centered on fluid page transitions.

### App Load Flow

`App.vue` orchestrates three sequential phases:
1. `AppLoad` — Animated SVG splash screen (skipped if `skip-appload` is set in `sessionStorage`)
2. `RouteChange` — Transition overlay used between route changes
3. `RouterView` — Page content (rendered only after `viewReady` flag)

`App.vue` also triggers all store fetches on mount (parallel async).

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

### Bilingual System (EN/FR)

`src/stores/locale.ts` manages the active locale (`'en'` | `'fr'`), persisted in `localStorage`. Toggling locale calls `triggerReload()`, which fires a callback registered by `App.vue` — it animates a close transition then triggers a full page reload. The `skip-appload` sessionStorage key is set before reload so the splash is bypassed.

All Strapi fetch functions accept a `locale` parameter. Stores silently fall back to French (`'fr'`) if the primary locale fetch returns no data.

### State Management

Pinia stores, all in `src/stores/`:
- `useProjectStore()` — projects array, active project by slug, content type (`'video' | 'gallery'`)
- `useLocaleStore()` — active locale, toggle, reload callback registration
- `useServiceStore()` — services page content
- `useContactStore()` — contact page content + team
- `useSharedStore()` — shared footer/branding content
- `usePolicyStore()` — policy pages, `getBySlug()` helper

### Component Organization

```
components/
  shared/     # Header, footer, project card, lightbox, nav, close button
  content/    # Content containers (1-col, 2-col, gallery, video, policy/markdown)
  grid/       # GridProjects (home), GridGallery, GridContact
  list/       # ListProjects, ListCredits
  single/     # ServicesContent, ServicesFooter (services page sections)
  transition/ # AppLoad splash, RouteTransition overlay
```

### Data Layer (`src/api/strapi.ts`)

All content is fetched from a **Strapi CMS** backend. Two environment variables are required:
- `VITE_STRAPI_URL` — base URL of the Strapi instance
- `VITE_STRAPI_TOKEN` — Bearer token for authenticated requests

Fetch functions: `getProjects`, `getService`, `getContact`, `getShared`, `getPolicies`.

**Critical:** Project slugs are derived at runtime via `slugify(title)` — there is no slug field in Strapi; routing depends entirely on this function staying stable. If a project title changes in Strapi, its URL breaks.

`coverImage(project)` returns the Cover image, falling back to first Gallery image.

Policy page content is rendered as markdown using `marked`.

### Routes

| Path | Name | Theme |
|------|------|-------|
| `/` | `home` | hasHeader |
| `/projects/:slug` | `single` | — |
| `/services` | `services` | hasHeader |
| `/contact` | `contact` | hasHeader |
| `/policy/:slug` | `policy` | hasHeader |

### Key Libraries

- **GSAP** — All animations (timelines, stagger, clipPath, transform)
- **Lenis** (`src/lib/lenis.ts`) — Smooth scroll singleton, shared across components; router guards pause/resume it during transitions
- **Vue Router** — Client-side routing with navigation guards for transitions
- **Pinia** — Minimal global state
- **marked** — Markdown rendering for policy/privacy pages

### Styling

- `src/assets/global.css` — CSS custom properties for colors, type scale, and theme classes (`theme-pink`, `theme-purple`, `theme-blue`, `theme-yellow`, `theme-gray`)
- Most components use `<style scoped>`
- Theme transitions use CSS `transition` on color/background (0.6s ease) applied to `<body>`
- Path alias `@` maps to `src/`

### Deployment

Deployed to Vercel (`vercel.json` in repo root).
