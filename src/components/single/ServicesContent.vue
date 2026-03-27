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

// startOffset % along path (converted from degrees: deg/360*100)
const baseOffsets  = [20, 80, 130, 160].map(d => d / 360 * 100)
const travelOffsets = [40, 65, 30, 55].map(d => d / 360 * 100)
const offsets      = ref([...baseOffsets])
const opacities   = ref([0, 0, 0, 0])
const scale       = ref(1)

const svgWidths   = [600, 700, 800, 900]
const targetPx    = 18
const fontSizes   = svgWidths.map(w => +(targetPx / (w / 100)).toFixed(3))

const isMobile        = window.innerWidth <= 900
const mobileSvgWs     = [0.6, 0.7, 0.8, 0.9].map(r => window.innerWidth * r)
const mobileFontSizes = mobileSvgWs.map(w => +(targetPx * 0.75 / (w / 100)).toFixed(3))
const desktopPath     = 'M 10,50 a 40,40 0 1,1 80,0 40,40 0 1,1 -80,0'
const mobilePath      = 'M 20,50 a 30,46 0 1,1 60,0 30,46 0 1,1 -60,0'

const fadeStarts  = [0, 0.08, 0.18, 0.28]
const fadeDur     = 0.25

onMounted(async () => {
    await serviceStore.fetchService()
    await nextTick()

    const svg = wrapRef.value?.querySelector('svg') as SVGElement | null
    svgEl.value = svg
    const col = sectionRef.value?.querySelector('.col') as HTMLElement | null

    const colHeight = col?.offsetHeight ?? 0
    const heroHeight = window.innerHeight - colHeight
    if (wrapRef.value) wrapRef.value.style.height = `${heroHeight}px`

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

    const scaleRange = window.innerHeight

    const onContentScroll = ({ scroll }: { scroll: number }) => {
        if (!wrapRef.value || !col) return
        const progress = Math.min(Math.max(scroll / colHeight, 0), 1)
        col.style.transform = `translateY(${progress * 100}%)`
        col.style.opacity = `${1 - progress}`
        wrapRef.value.style.height = `${heroHeight + progress * colHeight}px`

        if (svg) {
            const phase2 = Math.min(Math.max((scroll - colHeight) / scaleRange, 0), 1)
            gsap.set(svg, { scale: 1 - phase2 * 0.8 })
        }
    }

    const onTaglineScroll = () => {
        if (!taglineWrapRef.value) return
        const { top } = taglineWrapRef.value.getBoundingClientRect()
        const scrollRange = taglineWrapRef.value.offsetHeight - window.innerHeight
        if (scrollRange <= 0) return
        const p = Math.min(Math.max(-top / scrollRange, 0), 1)

        offsets.value   = baseOffsets.map((base, i) => base + p * (travelOffsets[i] ?? 0))
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
    <section ref="sectionRef">
        <div ref="wrapRef" class="hero">
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
                    <svg viewBox="0 0 100 100" :width="isMobile ? mobileSvgWs[0] : 600" :height="isMobile ? mobileSvgWs[0] : 600" :style="{ transform: `scale(${scale})`, opacity: opacities[0] }">
                        <defs>
                            <path id="cp1" :d="isMobile ? mobilePath : desktopPath" />
                        </defs>
                        <text :font-size="isMobile ? mobileFontSizes[0] : fontSizes[0]" fill="currentColor">
                            <textPath href="#cp1" :startOffset="`${offsets[0]}%`">{{ taglines[0] }}</textPath>
                        </text>
                    </svg>

                    <svg viewBox="0 0 100 100" :width="isMobile ? mobileSvgWs[1] : 700" :height="isMobile ? mobileSvgWs[1] : 700" :style="{ transform: `scale(${scale})`, opacity: opacities[1] }">
                        <defs>
                            <path id="cp2" :d="isMobile ? mobilePath : desktopPath" />
                        </defs>
                        <text :font-size="isMobile ? mobileFontSizes[1] : fontSizes[1]" fill="currentColor">
                            <textPath href="#cp2" :startOffset="`${offsets[1]}%`">{{ taglines[1] }}</textPath>
                        </text>
                    </svg>

                    <svg viewBox="0 0 100 100" :width="isMobile ? mobileSvgWs[2] : 800" :height="isMobile ? mobileSvgWs[2] : 800" :style="{ transform: `scale(${scale})`, opacity: opacities[2] }">
                        <defs>
                            <path id="cp3" :d="isMobile ? mobilePath : desktopPath" />
                        </defs>
                        <text :font-size="isMobile ? mobileFontSizes[2] : fontSizes[2]" fill="currentColor">
                            <textPath href="#cp3" :startOffset="`${offsets[2]}%`">{{ taglines[2] }}</textPath>
                        </text>
                    </svg>

                    <svg viewBox="0 0 100 100" :width="isMobile ? mobileSvgWs[3] : 900" :height="isMobile ? mobileSvgWs[3] : 900" :style="{ transform: `scale(${scale})`, opacity: opacities[3] }">
                        <defs>
                            <path id="cp4" :d="isMobile ? mobilePath : desktopPath" />
                        </defs>
                        <text :font-size="isMobile ? mobileFontSizes[3] : fontSizes[3]" fill="currentColor">
                            <textPath href="#cp4" :startOffset="`${offsets[3]}%`">{{ taglines[3] }}</textPath>
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
    width: 90%;
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
    h2 {
        font-family: 'body';
        font-size: var(--font-sm);
        text-transform: uppercase;
    }
    p {
        font-size: var(--text-regular);
    }
}


.hero {
    position: sticky;
    top: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tagline {
    height: 400vh;
    position: relative;
}

.items {
    position: sticky;
    top: -2em;
    height: 100vh;
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
        p {
            font-size: var(--text-sm);
        }
    }
}
</style>
