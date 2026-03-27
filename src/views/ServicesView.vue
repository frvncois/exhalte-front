<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import SharedHeader from '@/components/shared/SharedHeader.vue';
import ServicesContent from '@/components/single/ServicesContent.vue';
import ServicesFooter from '@/components/single/ServicesFooter.vue';


const mainRef = ref<HTMLElement | null>(null)
const contentRef = ref<{ taglineEl: HTMLElement | null } | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
    gsap.from(mainRef.value, { x: '100vw', duration: 1, ease: 'power4.inOut' })

    if (contentRef.value?.taglineEl) {
        observer = new IntersectionObserver(([entry]) => {
            if (!mainRef.value) return
            mainRef.value.style.transition = 'background 1s ease'
            mainRef.value.style.background = entry?.isIntersecting
                ? 'var(--framboise)'
                : 'var(--light)'
            setTimeout(() => { if (mainRef.value) mainRef.value.style.transition = '' }, 1000)
        }, { threshold: 0.1 })
        observer.observe(contentRef.value.taglineEl)
    }
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
    <SharedHeader />
    <main ref="mainRef">
        <ServicesContent ref="contentRef" />
        <ServicesFooter/>
    </main>
</template>

<style scoped>
main {
    background: var(--light);
}
</style>
