<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { registerPageLeave } from '@/transitions/projectTransition'

defineProps<{
    title: string
    items: { label: string; sub?: string | null }[]
}>()

const sectionRef = ref<HTMLElement | null>(null)
const ulRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

const expanded = ref(false)

function toggle() {
    if (!ulRef.value) return
    expanded.value = !expanded.value
    if (expanded.value) {
        gsap.set(ulRef.value, { display: 'flex', opacity: 0, y: -8 })
        gsap.to(ulRef.value, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
    } else {
        gsap.to(ulRef.value, {
            opacity: 0, y: -8, duration: 0.3, ease: 'power2.in',
            onComplete: () => { gsap.set(ulRef.value, { display: 'none' }) },
        })
    }
}

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

    unregisterLeave = registerPageLeave((done) => {
        gsap.to(sectionRef.value, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: done })
    })
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
    <section ref="sectionRef">
        <div class="header">
            <h3>{{ title }}</h3>
            <button class="toggle" @click="toggle">{{ expanded ? '(-)' : '(+)' }}</button>
        </div>
        <ul ref="ulRef">
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
    color: var(--gray);
}

ul {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1.5em;
    max-width: 70vw;
}

li {
  display: flex;
  align-items: center;
  gap: 2em;
}

li::after {
  content: '⬤';
  font-size: var(--text-xs);
  margin-left: 1em;
}

li:last-child::after {
  content: none;
}

.header {
    display: contents;
}

.toggle {
    display: none;
}

@media (max-width: 900px) {
    h4, h5 {
        font-size: var(--text-sm);
    }

    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5em;
    }

    h3 {
        text-align: center;
    }

    .toggle {
        display: block;
        all: unset;
        cursor: pointer;
        font-size: var(--text-sm);
        text-transform: uppercase;
    }

    ul {
        display: none;
    }
}
</style>
