<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import MainLogo from '@/assets/MainLogo.vue'
import { registerPageLeave } from '@/transitions/projectTransition'

const sectionRef = ref<HTMLElement | null>(null)
const logoRef    = ref<HTMLElement | null>(null)
let unregisterPageLeave: (() => void) | null = null

onMounted(() => {
    gsap.set(logoRef.value, { clipPath: 'inset(0 0 100% 0)' })
    gsap.to(logoRef.value, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 2,
        ease: 'power3.out',
        delay: 0.3,
    })

    unregisterPageLeave = registerPageLeave((done) => {
        gsap.to(sectionRef.value, { opacity: 0, duration: 1, ease: 'power2.in', onComplete: done })
    })
})

onUnmounted(() => {
    unregisterPageLeave?.()
})
</script>

<template>
    <section ref="sectionRef">
        <h1>Lorem ipsum dolor sit amet<br>consecteur ipsum dolor</h1>
        <div class="logo" ref="logoRef">
            <MainLogo />
        </div>
    </section>
</template>

<style scoped>
section {
    position: fixed;
    inset: 0;
    background: var(--pink);
    color: var(--light);
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

h1 {
    font-size: var(--text-regular);
    font-family: 'body';
    text-transform: uppercase;
    line-height: 1;
    text-align: center;
}

.logo {
    position: absolute;
    inset: 0;
    padding: 2em;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
}

:deep(svg) {
    width: 100%;
    height: auto;
    display: block;
}
</style>
