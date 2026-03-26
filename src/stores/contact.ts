import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getContact, type Contact } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'

export const useContactStore = defineStore('contact', () => {
  const contact = ref<Contact | null>(null)
  let fetched = false

  async function fetchContact() {
    if (fetched) return
    fetched = true
    const { locale } = useLocaleStore()
    try {
      contact.value = await getContact(locale)
    } catch {
      fetched = false
      if (locale !== 'fr') {
        try { contact.value = await getContact('fr') } catch {}
      }
    }
  }

  return { contact, fetchContact }
})
