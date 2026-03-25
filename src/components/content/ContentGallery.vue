<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { getFwdClones } from '@/transitions/projectTransition'

const coverRef = ref<HTMLElement | null>(null)
const extrasRef = ref<HTMLElement[]>([])

onMounted(() => {
    gsap.from(extrasRef.value, {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.1,
        delay: 0.5,
    })

    const clone = getFwdClones()[0]

    if (!clone) {
        gsap.from(coverRef.value, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power3.out' })
        return
    }

    if (!coverRef.value) return

    const dest = coverRef.value.getBoundingClientRect()

    gsap.set(coverRef.value, { opacity: 0 })
    gsap.to(clone, {
        x: dest.left - parseFloat(clone.style.left),
        y: dest.top - parseFloat(clone.style.top),
        width: dest.width,
        height: dest.height,
        duration: 0.9,
        ease: 'power3.inOut',
        onComplete: () => {
            clone.remove()
            gsap.set(coverRef.value!, { opacity: 1 })
        },
    })
})
</script>

<template>
    <section>
        <div class="cover" ref="coverRef" data-trans="cover"></div>
        <div class="cover" :ref="el => extrasRef[0] = el as HTMLElement"></div>
        <div class="cover" :ref="el => extrasRef[1] = el as HTMLElement"></div>
        <div class="cover" :ref="el => extrasRef[2] = el as HTMLElement"></div>
        <div class="cover" :ref="el => extrasRef[3] = el as HTMLElement"></div>
        <div class="cover" :ref="el => extrasRef[4] = el as HTMLElement"></div>
    </section>
</template>

<style scoped>
section {
    margin: 0 2em;
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 1em;
}

.cover {
    height: 80vh;
    background: black;
}
</style>
