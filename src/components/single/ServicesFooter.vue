<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import MainLogo from '@/assets/MainLogo.vue'
import lenis from '@/lib/lenis'

const logoRef = ref<HTMLElement | null>(null)

onMounted(() => {
    if (!logoRef.value) return

    gsap.set(logoRef.value, { clipPath: 'inset(0 0 100% 0)' })

    let triggered = false
    const check = () => {
        if (triggered || !logoRef.value) return
        const rect = logoRef.value.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.85) {
            triggered = true
            gsap.to(logoRef.value, {
                clipPath: 'inset(0 0 0% 0)',
                duration: 1.2,
                ease: 'power3.out',
            })
        }
    }

    lenis.on('scroll', check)
    check()

    onUnmounted(() => lenis.off('scroll', check))
})
</script>

<template>
    <section>
        <div class="logo" ref="logoRef">
            <MainLogo />
        </div>
    </section>
</template>

<style scoped>
section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4em 2em;
}

.logo {
    width: 100%;
}

:deep(svg) {
    width: 100%;
    height: auto;
    display: block;
}
@media (max-width: 900px) {
    section {
        padding: 1em;
    }
}
</style>
