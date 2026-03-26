import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPolicies, slugify } from '@/api/strapi'
import type { Policy } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'

export const usePolicyStore = defineStore('policyContent', () => {
  const policies = ref<Policy[]>([])
  let fetched = false

  async function fetchPolicies() {
    if (fetched) return
    fetched = true
    const { locale } = useLocaleStore()
    try {
      policies.value = await getPolicies(locale)
    } catch {
      fetched = false
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

