const BASE_URL = import.meta.env.VITE_STRAPI_URL as string
const TOKEN = import.meta.env.VITE_STRAPI_TOKEN as string

const authHeaders = { Authorization: `Bearer ${TOKEN}` }

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StrapiMedia {
  id: number
  url: string
  width: number
  height: number
  alternativeText: string | null
  formats: {
    thumbnail?: { url: string; width: number; height: number }
    small?: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
    large?: { url: string; width: number; height: number }
  }
}

export interface Directory {
  id: number
  documentId: string
  Name: string
  Biography: string | null
  Website: string | null
}

export interface Credit {
  id: number
  Title: string
  Directory: Directory[]
}

export interface Remerciement {
  id: number
  Name: string
  Website: string | null
}

export interface DetailsBlock {
  type: string
  children: { text: string; type: string }[]
}

export interface Project {
  id: number
  documentId: string
  Type: 'Video' | 'Gallery'
  Title: string
  Subtitle: string | null
  Video: string | null
  Details: DetailsBlock[]
  Cover: StrapiMedia | null
  Slideshow: StrapiMedia | null
  Gallery: StrapiMedia[]
  Credit: Credit[]
  Awards: unknown[]
  Press: unknown[]
  Remerciement: Remerciement[]
  createdAt: string
  updatedAt: string
  publishedAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Returns Cover if present, otherwise the first Gallery image. */
export function coverImage(project: Project): StrapiMedia | null {
  return project.Cover ?? project.Gallery[0] ?? null
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function strapiGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}/api${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { headers: authHeaders })
  if (!res.ok) throw new Error(`Strapi ${res.status}: ${path}`)
  const json = await res.json()
  return json.data as T
}

const PROJECT_POPULATE: Record<string, string> = {
  'populate[Cover][fields][0]': 'url',
  'populate[Cover][fields][1]': 'formats',
  'populate[Cover][fields][2]': 'alternativeText',
  'populate[Cover][fields][3]': 'width',
  'populate[Cover][fields][4]': 'height',
  'populate[Slideshow][fields][0]': 'url',
  'populate[Slideshow][fields][1]': 'formats',
  'populate[Slideshow][fields][2]': 'alternativeText',
  'populate[Slideshow][fields][3]': 'width',
  'populate[Slideshow][fields][4]': 'height',
  'populate[Gallery][fields][0]': 'url',
  'populate[Gallery][fields][1]': 'formats',
  'populate[Gallery][fields][2]': 'alternativeText',
  'populate[Gallery][fields][3]': 'width',
  'populate[Gallery][fields][4]': 'height',
  'populate[Credit][populate][Directory][fields][0]': 'Name',
  'populate[Credit][populate][Directory][fields][1]': 'Website',
  'populate[Remerciement][fields][0]': 'Name',
  'populate[Remerciement][fields][1]': 'Website',
}

export function getProjects(): Promise<Project[]> {
  return strapiGet<Project[]>('/projects', PROJECT_POPULATE)
}
