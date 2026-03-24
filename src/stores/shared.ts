import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getShared, type Shared } from '@/api/strapi'

export const useSharedStore = defineStore('shared', () => {
  const shared = ref<Shared | null>(null)

  async function fetchShared() {
    if (shared.value) return
    try {
      shared.value = await getShared()
    } catch {}
  }

  return { shared, fetchShared }
})
