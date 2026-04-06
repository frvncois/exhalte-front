<script setup lang="ts">
import { ref, watch } from 'vue'
import AppLoad from '@/components/transition/AppLoad.vue'
import RouteTransition from '@/components/transition/RouteTransition.vue'
import ShareClose from '@/components/shared/ShareClose.vue'
import { useProjectStore } from '@/stores/project'
import { useServiceStore } from '@/stores/service'
import { useContactStore } from '@/stores/contact'
import { useSharedStore } from '@/stores/shared'
import { usePolicyStore } from '@/stores/policyContent'
import { useManifestoStore } from '@/stores/manifesto'
import { useLocaleStore } from '@/stores/locale'

const viewReady = ref(false)
const appLoadDone = ref(false)
const localeKey = ref(0)

const projectStore = useProjectStore()
const serviceStore = useServiceStore()
const contactStore = useContactStore()
const sharedStore = useSharedStore()
const policyStore = usePolicyStore()
const manifestoStore = useManifestoStore()

function fetchAll() {
    projectStore.fetchProjects()
    serviceStore.fetchService()
    contactStore.fetchContact()
    sharedStore.fetchShared()
    policyStore.fetchPolicies()
    manifestoStore.fetchManifesto()
}

fetchAll()

watch(() => useLocaleStore().locale, () => {
    fetchAll()
    localeKey.value++
})
</script>

<template>
    <AppLoad v-if="!appLoadDone" @ready="viewReady = true" @done="appLoadDone = true" />
    <ShareClose v-if="viewReady && $route.name === 'single'" />
    <RouterView v-if="viewReady" :key="$route.fullPath + localeKey" />
    <RouteTransition />
</template>
