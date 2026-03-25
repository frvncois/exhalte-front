import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getProjects, slugify, coverImage, type Project, type StrapiMedia } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'

export type ProjectType = 'video' | 'gallery'

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const activeSlug = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeProject = computed(() =>
    projects.value.find(p => slugify(p.Title) === activeSlug.value) ?? null
  )

  const type = computed<ProjectType>(() =>
    (activeProject.value?.Type?.toLowerCase() as ProjectType) ?? 'video'
  )

  async function fetchProjects() {
    if (projects.value.length) return
    const { locale } = useLocaleStore()
    loading.value = true
    error.value = null
    try {
      projects.value = await getProjects(locale)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load projects'
    } finally {
      loading.value = false
    }
  }

  function setActiveSlug(slug: string) {
    activeSlug.value = slug
  }

  return {
    projects,
    activeProject,
    activeSlug,
    type,
    loading,
    error,
    fetchProjects,
    setActiveSlug,
    // kept for any legacy usage
    coverImage,
    slugify,
  }
})

export { type Project, type StrapiMedia }
