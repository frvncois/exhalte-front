import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getShared, type Shared } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'

export const useSharedStore = defineStore('shared', () => {
  const shared = ref<Shared | null>(null)

  async function fetchShared() {
    if (shared.value) return
    const { locale } = useLocaleStore()
    try {
      shared.value = await getShared(locale)
    } catch {
      if (locale !== 'fr') {
        try { shared.value = await getShared('fr') } catch {}
      }
    }
  }

  return { shared, fetchShared }
})
