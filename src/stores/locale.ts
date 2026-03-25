import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Locale = 'en' | 'fr'

export const useLocaleStore = defineStore('locale', () => {
  const stored = localStorage.getItem('locale')
  console.log('[locale] stored in localStorage:', stored)
  const locale = ref<Locale>((stored as Locale) ?? 'fr')
  console.log('[locale] active locale:', locale.value)

  const nextLabel = computed(() => locale.value === 'en' ? 'FR' : 'EN')

  function toggle() {
    const next: Locale = locale.value === 'en' ? 'fr' : 'en'
    console.log('[locale] toggling to:', next)
    localStorage.setItem('locale', next)
    console.log('[locale] saved, reloading...')
    window.location.reload()
  }

  return { locale, nextLabel, toggle }
})
