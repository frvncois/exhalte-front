<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import MainPath from '@/assets/MainPath.vue';
import lenis from '@/lib/lenis'
import { registerPageLeave } from '@/transitions/projectTransition'

const sectionRef = ref<HTMLElement | null>(null)
let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

onMounted(() => {
    const svg = sectionRef.value?.querySelector('svg') as SVGElement | null

    gsap.set(svg, { opacity: 0 })
    gsap.from(sectionRef.value, { opacity: 0, x: 40, duration: 1, delay: 0.5, ease: 'power3.out' })
    gsap.to(svg, { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.65 })

    unregisterLeave = registerPageLeave((done) => {
        gsap.to(svg, { opacity: 0, duration: 0.3, ease: 'power2.in' })
        gsap.to(sectionRef.value, { opacity: 0, x: 40, duration: 0.5, ease: 'power3.in', onComplete: done })
    })

    const onScroll = () => {
        if (!sectionRef.value || !svg) return
        const parent = sectionRef.value.parentElement!
        const { top } = parent.getBoundingClientRect()
        const scrollRange = parent.offsetHeight - window.innerHeight
        const progress = Math.min(Math.max(-top / scrollRange, 0), 1)
        svg.style.width = `${100 - progress * 90}%`
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
    height: 80%;
    color: currentColor;
    margin: auto;
}
</style>
