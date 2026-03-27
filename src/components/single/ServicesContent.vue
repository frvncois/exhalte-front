<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import MainPath from '@/assets/MainPath.vue'
import lenis from '@/lib/lenis'
import { registerPageLeave } from '@/transitions/projectTransition'
import { useServiceStore } from '@/stores/service'

const wrapRef = ref<HTMLElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)
const svgEl = ref<SVGElement | null>(null)
const taglineWrapRef = ref<HTMLElement | null>(null)
const taglineSectionRef = ref<HTMLElement | null>(null)
const serviceStore = useServiceStore()
let observer: IntersectionObserver | null = null
let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

const { service } = storeToRefs(serviceStore)
const taglines = computed(() => [
    service.value?.Tagline01 ?? '',
    service.value?.Tagline02 ?? '',
    service.value?.Tagline03 ?? '',
    service.value?.Tagline04 ?? '',
])

const baseAngles  = [20, 80, 130, 160]
const travelDegs  = [40, 65, 30, 55]
const angles      = ref([...baseAngles])
const opacities   = ref([0, 0, 0, 0])
const scale       = ref(1)

const svgWidths   = [600, 700, 800, 900]
const targetPx    = 18
const fontSizes   = svgWidths.map(w => +(targetPx / (w / 100)).toFixed(3))

const fadeStarts  = [0, 0.08, 0.18, 0.28]
const fadeDur     = 0.25

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
    const contentScrollRange = naturalHeight

    const onContentScroll = ({ scroll }: { scroll: number }) => {
        if (!sectionRef.value || !svg) return
        const progress = Math.min(Math.max(scroll / contentScrollRange, 0), 1)
        sectionRef.value.style.height = `${naturalHeight * (1 - progress)}px`
        svg.style.transform = `scale(${1 - progress * 0.8})`
    }

    const onTaglineScroll = () => {
        if (!taglineSectionRef.value) return
        const parent = taglineSectionRef.value.parentElement!
        const { top } = parent.getBoundingClientRect()
        const scrollRange = parent.offsetHeight - window.innerHeight
        if (scrollRange <= 0) return
        const p = Math.min(Math.max(-top / scrollRange, 0), 1)

        angles.value    = baseAngles.map((base, i) => base + p * (travelDegs[i] ?? 0))
        opacities.value = fadeStarts.map(start => Math.min(Math.max((p - start) / fadeDur, 0), 1))
        scale.value     = 1 + Math.min(Math.max((p - 0.7) / 0.3, 0), 1) * 4

        if (svgEl.value) {
            const opacity = 1 - Math.min(Math.max((p - 0.7) / 0.3, 0), 1)
            gsap.to(svgEl.value, { opacity, duration: 0.1, overwrite: true })
        }
    }

    lenis.on('scroll', onContentScroll)
    lenis.on('scroll', onTaglineScroll)
    onUnmounted(() => {
        lenis.off('scroll', onContentScroll)
        lenis.off('scroll', onTaglineScroll)
    })
})

onUnmounted(() => observer?.disconnect())

defineExpose({ taglineEl: taglineWrapRef })
</script>

<template>
    <section>
        <div class="hero">
            <MainPath />
        </div>
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
        <div class="tagline" ref="taglineWrapRef">
                <div class="items">
                    <svg viewBox="0 0 100 100" width="600" height="600" :style="{ transform: `rotate(${angles[0]}deg) scale(${scale})`, opacity: opacities[0] }">
                        <defs>
                            <path id="cp1" d="M 10,50 a 40,40 0 1,1 80,0 40,40 0 1,1 -80,0" />
                        </defs>
                        <text :font-size="fontSizes[0]" fill="currentColor">
                            <textPath href="#cp1" startOffset="0%">{{ taglines[0] }}</textPath>
                        </text>
                    </svg>

                    <svg viewBox="0 0 100 100" width="700" height="700" :style="{ transform: `rotate(${angles[1]}deg) scale(${scale})`, opacity: opacities[1] }">
                        <defs>
                            <path id="cp2" d="M 10,50 a 40,40 0 1,1 80,0 40,40 0 1,1 -80,0" />
                        </defs>
                        <text :font-size="fontSizes[1]" fill="currentColor">
                            <textPath href="#cp2" startOffset="0%">{{ taglines[1] }}</textPath>
                        </text>
                    </svg>

                    <svg viewBox="0 0 100 100" width="800" height="800" :style="{ transform: `rotate(${angles[2]}deg) scale(${scale})`, opacity: opacities[2] }">
                        <defs>
                            <path id="cp3" d="M 10,50 a 40,40 0 1,1 80,0 40,40 0 1,1 -80,0" />
                        </defs>
                        <text :font-size="fontSizes[2]" fill="currentColor">
                            <textPath href="#cp3" startOffset="0%">{{ taglines[2] }}</textPath>
                        </text>
                    </svg>

                    <svg viewBox="0 0 100 100" width="900" height="900" :style="{ transform: `rotate(${angles[3]}deg) scale(${scale})`, opacity: opacities[3] }">
                        <defs>
                            <path id="cp4" d="M 10,50 a 40,40 0 1,1 80,0 40,40 0 1,1 -80,0" />
                        </defs>
                        <text :font-size="fontSizes[3]" fill="currentColor">
                            <textPath href="#cp4" startOffset="0%">{{ taglines[3] }}</textPath>
                        </text>
                    </svg>
                </div>
        </div>
    </section>
</template>


<style scoped>
.sticky section {
    flex-shrink: 0;
    overflow: hidden;
}

.hero svg {
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


.hero {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tagline {
    height: 100vh;
    position: relative;
}

.tagline section {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.items {
    position: relative;
    height: 100vh;
    top: -2.5em;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.items svg {
    position: absolute;
    color: currentColor;
}

@media (max-width: 900px) {
    .hero svg {
        height: auto;
    }
    .col {
        flex-direction: column;
        gap: 4em;
        padding: 1em;
    }
}
</style>
