<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { registerPageLeave } from '@/transitions/projectTransition'

defineProps<{
    title: string
    items: { label: string; sub?: string | null }[]
}>()

const sectionRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
    const h3 = sectionRef.value?.querySelector('h3')
    const lis = sectionRef.value?.querySelectorAll('li')
    if (!h3 || !lis) return

    gsap.set(h3, { opacity: 0 })
    gsap.set(lis, { opacity: 0 })

    observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return
        const tl = gsap.timeline()
        tl.to(h3, { opacity: 1, duration: 0.8, ease: 'power2.out' })
        tl.to(lis, { opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.08 }, '-=0.3')
        observer?.disconnect()
    }, { threshold: 0.2 })

    observer.observe(sectionRef.value!)

    registerPageLeave((done) => {
        gsap.to(sectionRef.value, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: done })
    })
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
    <section ref="sectionRef">
        <h3>{{ title }}</h3>
        <ul>
            <li v-for="(item, i) in items" :key="i">
                <h4>{{ item.label }}</h4>
                <h5 v-if="item.sub">{{ item.sub }}</h5>
            </li>
        </ul>
    </section>
</template>

<style scoped>
section {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 2em;
}
h4, h5 {
    font-size: var(--text-regular);
    font-family: 'heading';
}

h5 {
    color: var(--medium);
}

ul {
    display: flex;
    flex-wrap: wrap;
    column-gap: 2em;
}

li {
    display: flex;
    align-items: center;
    gap: 2em;
    &:after {
        content:'⬤';
        font-size: var(--text-xs);
    }
}
</style>
