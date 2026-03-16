<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import SharedHeader from '@/components/shared/SharedHeader.vue';
import Content2col from '@/components/content/Content2col.vue';
import ServicesHero from '@/components/single/ServicesHero.vue';
import ServicesTagline from '@/components/single/ServicesTagline.vue';

const mainRef = ref<HTMLElement | null>(null)
const taglineRef = ref<{ $el: HTMLElement } | null>(null)
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

onUnmounted(() => observer?.disconnect())
</script>

<template>
    <SharedHeader />
    <main ref="mainRef">
        <ServicesHero />
        <Content2col />
        <ServicesTagline ref="taglineRef" />
    </main>
</template>

<style scoped>
main {
    background: var(--light);
}
</style>
