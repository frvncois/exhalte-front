<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'
import { registerPageLeave } from '@/transitions/projectTransition'

const sectionRef = ref<HTMLElement | null>(null)
const { activeProject } = storeToRefs(useProjectStore())
let observer: IntersectionObserver | null = null
let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

onMounted(() => {
    gsap.set(sectionRef.value, { opacity: 0 })
    observer = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) {
            gsap.to(sectionRef.value, { opacity: 1, duration: 1.2, ease: 'power2.out' })
            observer?.disconnect()
        }
    }, { threshold: 0.2 })
    observer.observe(sectionRef.value!)

    unregisterLeave = registerPageLeave((done) => {
        gsap.to(sectionRef.value, { opacity: 0, duration: 0.4, ease: 'power2.in', onComplete: done })
    })
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
    <section ref="sectionRef">
        <div>
            <p
                v-for="(block, i) in activeProject?.Details"
                :key="i"
            >{{ block.children.map((c: { text: string }) => c.text).join('') }}</p>
        </div>
    </section>
</template>

<style scoped>
section {
    padding: 2em;
    display: grid;
    grid-template-columns: 1fr 1fr;
}
@media (max-width: 768px) {
    section { grid-template-columns: 1fr; }
}

div {
    display: flex;
    flex-direction: column;
    gap: 2em;
}

p {
    font-size: var(--text-regular);
}
</style>
