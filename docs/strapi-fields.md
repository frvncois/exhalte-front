# Strapi Fields Reference

## Project (collection: `api::project.project`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | Internal Strapi ID |
| `documentId` | string | Stable public ID (use this for references) |
| `Title` | string | Project title — also used to generate the URL slug |
| `Subtitle` | string \| null | Short tagline shown below the title |
| `Type` | `"Video"` \| `"Gallery"` | Determines layout in SingleView |
| `Video` | string \| null | Video URL (Dropbox, Vimeo, etc.) |
| `Details` | RichText[] | Long-form description — Strapi rich text (array of blocks) |
| `Cover` | Media \| null | Single cover image — used as the grid thumbnail when set |
| `Slideshow` | Media \| null | Single image used as a hero/slideshow still |
| `Gallery` | Media[] | All project images — fallback cover if `Cover` is null |
| `Credit` | Credit[] | Crew credits (see below) |
| `Awards` | unknown[] | Award entries — not yet structured |
| `Press` | unknown[] | Press entries — not yet structured |
| `Remerciement` | Remerciement[] | Thank-you credits (see below) |
| `publishedAt` | string | ISO date |
| `locale` | string | e.g. `"en"` |

---

## Media (used in `Cover`, `Slideshow`, `Gallery[]`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `documentId` | string | |
| `url` | string | Full-resolution URL |
| `alternativeText` | string \| null | Alt text |
| `caption` | string \| null | |
| `width` | number | px |
| `height` | number | px |
| `formats.thumbnail` | `{ url, width, height }` | ~156px tall |
| `formats.small` | `{ url, width, height }` | ~500px tall |
| `formats.medium` | `{ url, width, height }` | ~750px tall |
| `formats.large` | `{ url, width, height }` | ~1000px tall |
| `mime` | string | e.g. `"image/webp"` |

> The code uses `formats.medium?.url ?? url` as the display image.

---

## Credit (component, used in `Credit[]`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `Title` | string | Role label, e.g. `"Director"` |
| `Directory` | Directory[] | People attached to this role (requires deep populate) |

---

## Directory (collection: `api::directory.directory`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `documentId` | string | |
| `Name` | string | Person's name |
| `Biography` | string \| null | |
| `Website` | string \| null | |

> `Directory` is only returned when using deep populate on `Credit`.
> With `populate=*`, `Credit[].Directory` comes back as `[]`.

---

## Remerciement (component, used in `Remerciement[]`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `Name` | string | |
| `Website` | string \| null | |

---

## Rich Text block (used in `Details[]`)

```json
{
  "type": "paragraph",
  "children": [
    { "type": "text", "text": "The actual text content." }
  ]
}
```

Each block is a paragraph. Text is in `children[].text`.

---

## Service (single type: `api::service.service`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `documentId` | string | |
| `Title` | string | Section heading, e.g. `"Who we are"` |
| `Intro` | RichText[] | Introductory text — same rich text block format as `Details` |
| `Tagline01` | string | e.g. `"Le mouvement est une pensée"` |
| `Tagline02` | string | e.g. `"Movement is a thought"` |
| `Tagline03` | string | e.g. `"Raconter le monde à travers les corps"` |
| `Tagline04` | string | e.g. `"Telling the world through bodies"` |
| `Services` | ServiceItem[] | List of service entries (see below) |
| `locale` | string | e.g. `"en"` |

### ServiceItem (component, used in `Services[]`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `Title` | string | Service name, e.g. `"Studio Créatif"`, `"Production"` |
| `Details` | string | Short description of the service |

> Fetch endpoint: `GET /api/service?populate=*`

---

## Contact (single type: `api::contact.contact`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `documentId` | string | |
| `Address` | string | Multiline string — `\n` for line breaks. e.g. `"66 rue de Rome\n75008 Paris"` |
| `Phone` | string | General studio phone number |
| `Linkedin` | string \| null | LinkedIn URL |
| `Instagram` | string \| null | Instagram URL |
| `Team` | TeamMember[] | List of team members (see below) |
| `locale` | string | e.g. `"en"` |

### TeamMember (component, used in `Team[]`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `Name` | string | Full name, e.g. `"Marielle Elis"` |
| `Title` | string | Job title, e.g. `"Founder & Producer"` |
| `Phone` | string | Direct phone number |
| `Email` | string | Direct email address |

> Fetch endpoint: `GET /api/contact?populate=*`

---

## Shared (single type: `api::shared.shared`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `documentId` | string | |
| `Title` | string | Studio name, e.g. `"Exhalte/Artistic production company"` |
| `Tagline` | string | Hero tagline, e.g. `"Movement/is a tought"` |
| `Copyright` | string | Footer copyright line, e.g. `"©2026 all rights reserved"` |

> Fetch endpoint: `GET /api/shared?populate=*`
