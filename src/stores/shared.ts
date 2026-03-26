import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getShared, type Shared } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'

export const useSharedStore = defineStore('shared', () => {
  const shared = ref<Shared | null>(null)
  let fetched = false

  async function fetchShared() {
    if (fetched) return
    fetched = true
    const { locale } = useLocaleStore()
    try {
      shared.value = await getShared(locale)
    } catch {
      fetched = false
      if (locale !== 'fr') {
        try { shared.value = await getShared('fr') } catch {}
      }
    }
  }

  return { shared, fetchShared }
})
