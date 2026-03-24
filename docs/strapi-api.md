# Strapi API Map

**Base URL:** `https://supreme-benefit-f8c038498a.strapiapp.com`
**Media CDN:** `https://supreme-benefit-f8c038498a.media.strapiapp.com`
**Auth:** Bearer token in `VITE_STRAPI_TOKEN` (read-only)

---

## Endpoints

Only one content type is accessible with the current token:

| Endpoint | Method | Description |
|---|---|---|
| `GET /api/projects` | populated | All projects with media, credits, remerciements |

All other tested endpoints (`/services`, `/pages`, `/works`, `/about`, `/contacts`, etc.) return 404.
`/api/directories` exists as a relation target but is not directly accessible.

---

## Project fields

| Field | Type | Notes |
|---|---|---|
| `id` | integer | Internal numeric ID |
| `documentId` | string | Stable UUID — used as Vue `:key` |
| `Type` | `"Video" \| "Gallery"` | Controls SingleView layout |
| `Title` | string | Used as display name and slugified for routing |
| `Subtitle` | string \| null | Null on most records; shown in grid if present |
| `Video` | string \| null | Direct video file URL (only COR populated) |
| `Details` | `DetailsBlock[]` | Rich text as Strapi Blocks array |
| `Cover` | `StrapiMedia \| null` | Single hero image (only COR populated) |
| `Slideshow` | `StrapiMedia \| null` | Null on all records |
| `Gallery` | `StrapiMedia[]` | 5–16 images per project |
| `Credit` | `Credit[]` | Repeatable component — role + linked directory entries |
| `Remerciement` | `Remerciement[]` | Repeatable component — name + optional website |
| `Awards` | array | Empty on all current records |
| `Press` | array | Empty on all current records |

---

## Media shape (`StrapiMedia`)

```ts
{
  id: number
  url: string                  // full URL on CDN
  width: number
  height: number
  alternativeText: string | null
  formats: {
    thumbnail?: { url, width, height }
    small?:     { url, width, height }
    medium?:    { url, width, height }
    large?:     { url, width, height }
  }
}
```

All images are `.webp`. The front end prefers `formats.medium.url` with a fallback to `url`.

---

## Nested components

### Credit
```ts
{
  id: number
  Title: string         // role label, e.g. "Réalisatrice", "DOP"
  Directory: Directory[]
}
```

### Directory (relation — deep populated via `populate[Credit][populate]=*`)
```ts
{
  id: number
  documentId: string
  Name: string
  Biography: string | null
  Website: string | null
}
```

### Remerciement
```ts
{
  id: number
  Name: string
  Website: string | null
}
```

---

## Populate query used

```
populate[Cover]=*
populate[Gallery]=*
populate[Credit][populate]=*   ← deep populate to resolve Directory relations
populate[Remerciement]=*
```

`Details` and `Slideshow` are returned without explicit populate (Strapi returns them by default).

---

## Current data state (as of setup)

| Project | Cover | Gallery | Video | Credits | Remerciements |
|---|---|---|---|---|---|
| La Symphonie des Eclairs | — | 13 | — | 0 | 0 |
| Hacernos Asi | — | 6 | — | 8 | 0 |
| Le Coq Sportif | — | 9 | — | 0 | 0 |
| RATP | — | 5 | — | 16 | 0 |
| COR | ✓ | 16 | ✓ Dropbox MP4 | 19 | 7 |

Most projects have no `Cover` yet — the front end falls back to `Gallery[0]`.

---

## Front-end mapping

| Strapi field | Used in |
|---|---|
| `Title` → `slugify()` | Route param `/projects/:slug` |
| `Type` | `useProjectStore.type` → SingleView layout (`is-video` / `is-gallery`) |
| `Cover ?? Gallery[0]` | Grid card cover image (`coverImage()` helper) |
| `Title`, `Subtitle` | Grid card text |
| `Gallery` | `GridGallery`, `ContentGallery` |
| `Video` | `ContentVideo` |
| `Details` | `Content1col` |
| `Credit[].Title + Directory[]` | `ListCredits` |
| `Remerciement[]` | `ListCredits` |
