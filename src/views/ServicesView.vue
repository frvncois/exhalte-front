<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { gsap } from 'gsap'
import SharedHeader from '@/components/shared/SharedHeader.vue';
import ServicesContent from '@/components/single/ServicesContent.vue';
import ServicesTagline from '@/components/single/ServicesTagline.vue';
import ServicesFooter from '@/components/single/ServicesFooter.vue';


const mainRef = ref<HTMLElement | null>(null)
const taglineRef = ref<{ $el: HTMLElement, progress: number } | null>(null)
const contentRef = ref<{ svgEl: SVGElement | null } | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
    gsap.from(mainRef.value, { x: '100vw', duration: 1, ease: 'power4.inOut' })

    if (taglineRef.value) {
        observer = new IntersectionObserver(([entry]) => {
            if (!mainRef.value) return
            mainRef.value.style.transition = 'background 1s ease'
            mainRef.value.style.background = entry?.isIntersecting
                ? 'var(--framboise)'
                : 'var(--light)'
            setTimeout(() => { if (mainRef.value) mainRef.value.style.transition = '' }, 1000)
        }, { threshold: 0.1 })
        observer.observe(taglineRef.value.$el)
    }
})

watch(() => taglineRef.value?.progress, (p) => {
    if (p === undefined) return
    const el = contentRef.value?.svgEl
    if (!el) return
    const opacity = 1 - Math.min(Math.max((p - 0.7) / 0.3, 0), 1)
    gsap.to(el, { opacity, duration: 0.1, overwrite: true })
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
    <SharedHeader />
    <main ref="mainRef">
        <ServicesContent ref="contentRef" />
        <ServicesTagline ref="taglineRef" />
        <ServicesFooter/>
    </main>
</template>

<style scoped>
main {
    background: var(--light);
}
</style>
