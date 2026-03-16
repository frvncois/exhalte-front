<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import MainPath from '@/assets/MainPath.vue';
import lenis from '@/lib/lenis'

const sectionRef = ref<HTMLElement | null>(null)

onMounted(() => {
    gsap.from(sectionRef.value, { opacity: 0, x: 40, duration: 1, delay: 0.5, ease: 'power3.out' })

    const svg = sectionRef.value?.querySelector('svg') as SVGElement | null

    const onScroll = () => {
        if (!sectionRef.value || !svg) return
        const parent = sectionRef.value.parentElement!
        const { top } = parent.getBoundingClientRect()
        const scrollRange = parent.offsetHeight - window.innerHeight
        const progress = Math.min(Math.max(-top / scrollRange, 0), 1)
        svg.style.width = `${100 - progress * 80}%`
    }

    lenis.on('scroll', onScroll)
    onUnmounted(() => lenis.off('scroll', onScroll))
})
</script>

<template>
    <section ref="sectionRef">
        <MainPath />
    </section>
</template>

<style scoped>
section {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    height: 100vh;
    padding: 0 2em;
}

svg {
    width: 100%;
    height: 100%;
    color: currentColor;
    margin: auto;
}
</style>
