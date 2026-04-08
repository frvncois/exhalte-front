<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import MainLogo from '@/assets/MainLogo.vue'
import { registerPageLeave } from '@/transitions/projectTransition'
import { useServiceStore } from '@/stores/service'

const { service } = storeToRefs(useServiceStore())

const sectionRef = ref<HTMLElement | null>(null)
const logoRef    = ref<HTMLElement | null>(null)
const h1Ref      = ref<HTMLElement | null>(null)
let unregisterPageLeave: (() => void) | null = null

onMounted(() => {
    const outer = h1Ref.value?.querySelectorAll('.po') ?? []
    const inner = h1Ref.value?.querySelectorAll('.pi') ?? []
    gsap.set([outer, inner], { opacity: 0 })
    gsap.to(outer, { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.3 })
    gsap.to(inner, { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.7 })

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
        <h1 ref="h1Ref"><span class="po">(</span><span class="pi">(</span> welcome <span class="pi">)</span><span class="po">)</span></h1>
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
