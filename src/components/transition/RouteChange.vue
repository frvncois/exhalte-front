<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { registerRouteChange, registerRouteChangeOut } from '@/transitions/projectTransition'

const el = ref<HTMLElement | null>(null)

onMounted(() => {
    gsap.set(el.value, { scaleY: 0 })

    registerRouteChange((done, bg) => {
        gsap.set(el.value, { backgroundColor: bg })
        gsap.to(el.value, {
            scaleY: 1,
            duration: 1,
            ease: 'power2.inOut',
            onComplete: done,
        })
    })

    registerRouteChangeOut(() => {
        gsap.set(el.value, { scaleY: 0 })
    })
})
</script>

<template>
    <div ref="el"></div>
</template>

<style scoped>
div {
    position: fixed;
    inset: 0;
    z-index: 15;
    transform-origin: bottom;
}
</style>
