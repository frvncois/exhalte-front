<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import MainPath from '@/assets/MainPath.vue'
import lenis from '@/lib/lenis'
import { registerPageLeave } from '@/transitions/projectTransition'
import { useServiceStore } from '@/stores/service'

const sectionRef = ref<HTMLElement | null>(null)
const serviceStore = useServiceStore()
let observer: IntersectionObserver | null = null
let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

onMounted(async () => {
    await serviceStore.fetchService()

    const svg = sectionRef.value?.querySelector('svg') as SVGElement | null
    const col = sectionRef.value?.querySelector('.col') as HTMLElement | null

    gsap.set(svg, { opacity: 0 })
    gsap.from(sectionRef.value, { opacity: 0, x: 40, duration: 1, delay: 0.5, ease: 'power3.out' })
    gsap.to(svg, { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.65 })

    gsap.set(col, { opacity: 0, x: 40 })
    observer = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) {
            gsap.to(col, { opacity: 1, x: 0, duration: 1, ease: 'power2.out' })
            observer?.disconnect()
        }
    }, { threshold: 0.2 })
    observer.observe(col!)

    unregisterLeave = registerPageLeave((done) => {
        gsap.to(svg, { opacity: 0, duration: 0.3, ease: 'power2.in' })
        gsap.to(sectionRef.value, { opacity: 0, x: 40, duration: 0.5, ease: 'power3.in', onComplete: done })
    })

    const onScroll = () => {
        if (!sectionRef.value || !svg) return
        const parent = sectionRef.value.parentElement!
        const { top } = parent.getBoundingClientRect()
        const scrollRange = parent.offsetHeight - window.innerHeight
        const progress = Math.min(Math.max(-top / scrollRange, 0), 1)
        svg.style.width = `${100 - progress * 90}%`
    }

    lenis.on('scroll', onScroll)
    onUnmounted(() => lenis.off('scroll', onScroll))
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
    <section ref="sectionRef">
        <div class="hero">
            <MainPath />
        </div>
        <div class="col">
            <div>
                <h2>(Services)</h2>
                <ul>
                    <li v-for="item in serviceStore.service?.Services" :key="item.id">
                        <h3>{{ item.Title }}</h3>
                        <p>{{ item.Details }}</p>
                    </li>
                </ul>
            </div>
            <div>
                <h2>({{ serviceStore.service?.Title }})</h2>
                <p
                    v-for="(block, i) in serviceStore.service?.Intro"
                    :key="i"
                >{{ block.children.map((c: { text: string }) => c.text).join('') }}</p>
            </div>
        </div>
    </section>
</template>

<style scoped>
section {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.hero {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    flex: 1;
    min-height: 0;
}

svg {
    width: 100%;
    height: 100%;
    display: block;
    color: currentColor;
}

.col {
    padding: 2em;
    display: flex;
    div:first-child {
        flex: 1;
    }
    div:last-child {
        flex: 2;
    }
    ul {
        display: flex;
        flex-direction: column;
        gap: 1em;
    }
    li p {
        font-size: var(--font-sm);
        max-width: 45ch;
    }
}

@media (max-width: 768px) {
    .col { flex-direction: column; gap: 2em; }
}

h2 {
    font-family: 'body';
    text-transform: uppercase;
    font-size: 1em;
    margin-bottom: 2em;
}

h3 {
    font-family: 'heading';
}

p {
    font-size: 1.5em;
}
</style>
