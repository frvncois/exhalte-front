import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getService, type Service } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'

export const useServiceStore = defineStore('service', () => {
  const service = ref<Service | null>(null)
  let fetched = false

  async function fetchService() {
    if (fetched) return
    fetched = true
    const { locale } = useLocaleStore()
    try {
      service.value = await getService(locale)
    } catch {
      fetched = false
      if (locale !== 'fr') {
        try { service.value = await getService('fr') } catch {}
      }
    }
  }

  return { service, fetchService }
})
