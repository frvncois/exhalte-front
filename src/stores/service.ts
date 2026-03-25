import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getService, type Service } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'

export const useServiceStore = defineStore('service', () => {
  const service = ref<Service | null>(null)

  async function fetchService() {
    if (service.value) return
    const { locale } = useLocaleStore()
    try {
      service.value = await getService(locale)
    } catch {}
  }

  return { service, fetchService }
})
