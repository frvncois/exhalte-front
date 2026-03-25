import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPolicies, slugify, type Policy } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'

export const usePolicyStore = defineStore('policyContent', () => {
  const policies = ref<Policy[]>([])

  async function fetchPolicies() {
    if (policies.value.length) return
    const { locale } = useLocaleStore()
    try {
      policies.value = await getPolicies(locale)
    } catch {
      if (locale !== 'fr') {
        try { policies.value = await getPolicies('fr') } catch {}
      }
    }
  }

  function getBySlug(slug: string): Policy | null {
    return policies.value.find(p => slugify(p.Title) === slug) ?? null
  }

  return { policies, fetchPolicies, getBySlug }
})

export { type Policy }
