<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { registerRouteTransition, registerRouteTransitionOut } from '@/transitions/projectTransition'

const el = ref<HTMLElement | null>(null)

onMounted(() => {
    gsap.set(el.value, { height: 0 })

    registerRouteTransition((done, bg) => {
        gsap.set(el.value, { backgroundColor: bg, height: 0 })
        gsap.to(el.value, {
            height: '100vh',
            duration: 1,
            ease: 'power2.inOut',
            onComplete: done,
        })
    })

    registerRouteTransitionOut(() => {
        gsap.set(el.value, { height: 0 })
    })
})
</script>

<template>
    <div ref="el"></div>
</template>

<style scoped>
div {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
}
</style>
