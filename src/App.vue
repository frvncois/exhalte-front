<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import AppLoad from '@/components/transition/AppLoad.vue'
import RouteTransition from '@/components/transition/RouteTransition.vue'
import { useProjectStore } from '@/stores/project'
import { useServiceStore } from '@/stores/service'
import { useContactStore } from '@/stores/contact'
import { useSharedStore } from '@/stores/shared'
import { usePolicyStore } from '@/stores/policyContent'
import { registerReload, triggerPageLeave, triggerHeaderLeave } from '@/transitions/projectTransition'

const skipAppLoad = sessionStorage.getItem('skip-appload') === '1'
if (skipAppLoad) sessionStorage.removeItem('skip-appload')
const viewReady = ref(skipAppLoad || document.body.classList.contains('app-loaded'))
const reloadOverlayRef = ref<HTMLElement | null>(null)

useProjectStore().fetchProjects()
useServiceStore().fetchService()
useContactStore().fetchContact()
useSharedStore().fetchShared()
usePolicyStore().fetchPolicies()

onMounted(() => {
    registerReload(() => {
        Promise.all([
            new Promise<void>(resolve => triggerHeaderLeave(resolve)),
            new Promise<void>(resolve => triggerPageLeave(resolve)),
        ]).then(() => {
            gsap.to(reloadOverlayRef.value, {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.in',
                onComplete: () => window.location.reload(),
            })
        })
    })
})
</script>

<template>
    <AppLoad v-if="!skipAppLoad" @ready="viewReady = true" />
    <RouterView v-if="viewReady" :key="$route.fullPath" />
    <RouteTransition />
</template>
