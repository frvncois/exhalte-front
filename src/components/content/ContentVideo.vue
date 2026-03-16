<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { getFwdClones } from '@/transitions/projectTransition'

const coverRef = ref<HTMLElement | null>(null)

onMounted(() => {
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
        scaleX: dest.width / parseFloat(clone.style.width),
        scaleY: dest.height / parseFloat(clone.style.height),
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
        <div class="cover" ref="coverRef" data-trans="cover">
            Video
        </div>
    </section>
</template>

<style scoped>
section {
    margin: 0 2em;
}
div {
    height: 80vh;
    background: black;
}
</style>
