import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getManifesto, type Manifesto } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'

export const useManifestoStore = defineStore('manifesto', () => {
  const manifesto = ref<Manifesto | null>(null)
  let fetched = false

  async function fetchManifesto() {
    if (fetched) return
    fetched = true
    const { locale } = useLocaleStore()
    try {
      manifesto.value = await getManifesto(locale)
    } catch {
      fetched = false
      if (locale !== 'fr') {
        try { manifesto.value = await getManifesto('fr') } catch {}
      }
    }
  }

  return { manifesto, fetchManifesto }
})
