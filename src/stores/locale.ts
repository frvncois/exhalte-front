import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Locale = 'en' | 'fr'

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>((localStorage.getItem('locale') as Locale) ?? 'fr')

  const nextLabel = computed(() => locale.value === 'en' ? 'FR' : 'EN')

  function toggle() {
    const next: Locale = locale.value === 'en' ? 'fr' : 'en'
    localStorage.setItem('locale', next)
    sessionStorage.setItem('skip-appload', '1')
    location.reload()
  }

  return { locale, nextLabel, toggle }
})
