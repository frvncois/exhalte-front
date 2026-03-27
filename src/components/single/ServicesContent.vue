<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap } from 'gsap'
import MainPath from '@/assets/MainPath.vue'
import lenis from '@/lib/lenis'
import { registerPageLeave } from '@/transitions/projectTransition'
import { useServiceStore } from '@/stores/service'

const wrapRef = ref<HTMLElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)
const svgEl = ref<SVGElement | null>(null)
const serviceStore = useServiceStore()
let observer: IntersectionObserver | null = null
let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

onMounted(async () => {
    await serviceStore.fetchService()
    await nextTick()

    const svg = wrapRef.value?.querySelector('svg') as SVGElement | null
    svgEl.value = svg
    const col = sectionRef.value?.querySelector('.col') as HTMLElement | null

    gsap.set(svg, { opacity: 0 })
    gsap.from(wrapRef.value, { opacity: 0, x: 40, duration: 1, delay: 0.5, ease: 'power3.out' })
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
        gsap.to(wrapRef.value, { opacity: 0, x: 40, duration: 0.5, ease: 'power3.in', onComplete: done })
    })

    const naturalHeight = sectionRef.value!.offsetHeight
    const scrollRange = naturalHeight

    const onScroll = ({ scroll }: { scroll: number }) => {
        if (!sectionRef.value || !svg) return
        const progress = Math.min(Math.max(scroll / scrollRange, 0), 1)
        sectionRef.value.style.height = `${naturalHeight * (1 - progress)}px`
        svg.style.transform = `scale(${1 - progress * 0.8})`
    }

    lenis.on('scroll', onScroll)
    onUnmounted(() => lenis.off('scroll', onScroll))
})

onUnmounted(() => observer?.disconnect())

defineExpose({ svgEl })
</script>

<template>
    <div class="sticky" ref="wrapRef">
        <div class="hero">
            <MainPath />
        </div>
        <section ref="sectionRef">
        <div class="col">
            <div>
                <div>
                    <h2>(Services)</h2>
                    <ul>
                        <li v-for="item in serviceStore.service?.Services" :key="item.id">
                            <h3>{{ item.Title }}</h3>
                        </li>
                    </ul>
                </div>
                <h2>Newsletter ></h2>
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
    </div>
</template>


<style scoped>
section {
    flex-shrink: 0;
    overflow: hidden;
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
        display: flex;
        flex-direction: column;
        gap: 1em;
    }
    div:last-child {
        flex: 2;
        display: flex;
        flex-direction: column;
        gap: 1em;
    }
    ul {
        display: flex;
        flex-direction: column;
    }
    li p {
        font-size: var(--font-sm);
        max-width: 45ch;
        margin-left: 2em;
    }
    h2 {
        font-family: 'body';
        font-size: var(--font-sm);
        text-transform: uppercase;
    }
}
.sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    padding-bottom: 2em;
    display: flex;
    flex-direction: column;
}

.hero {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
@media (max-width: 900px) {
    svg {
        height: auto;
    }
    .col {
        flex-direction: column;
        gap: 4em;
        padding: 1em;
    }
}
</style>
