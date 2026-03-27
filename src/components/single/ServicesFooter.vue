<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import MainLogo from '@/assets/MainLogo.vue'

const parenLeftRef = ref<HTMLElement | null>(null)
const parenRightRef = ref<HTMLElement | null>(null)

onMounted(() => {
    gsap.set([parenLeftRef.value, parenRightRef.value], { opacity: 0 })
})

function onEnter() {
    gsap.fromTo(parenLeftRef.value, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' })
    gsap.fromTo(parenRightRef.value, { opacity: 0, x: 6 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' })
}

function onLeave() {
    gsap.to(parenLeftRef.value, { opacity: 0, x: -6, duration: 0.25, ease: 'power2.in' })
    gsap.to(parenRightRef.value, { opacity: 0, x: 6, duration: 0.25, ease: 'power2.in' })
}
</script>

<template>
    <section>
        <RouterLink to="/contact" @mouseenter="onEnter" @mouseleave="onLeave">
            <span ref="parenLeftRef">(</span>( Contact us )<span ref="parenRightRef">)</span>
        </RouterLink>
        <MainLogo />
    </section>
</template>

<style scoped>
section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8em;
    padding: 2em;
}

a {
    display: flex;
    align-items: center;
    cursor: pointer;
}
</style>
