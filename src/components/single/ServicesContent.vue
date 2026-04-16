<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { storeToRefs } from 'pinia'
import MainPath from '@/assets/MainPath.vue'
import lenis from '@/lib/lenis'
import { useServiceStore } from '@/stores/service'
import {
    CIRCULAR_DESKTOP_PATH, CIRCULAR_MOBILE_PATH,
    CIRCULAR_SVG_WIDTHS, CIRCULAR_FONT_SIZES,
    CIRCULAR_BASE_OFFSETS, CIRCULAR_TRAVEL_OFFSETS,
    circularMobileSvgWidths, circularMobileFontSizes,
} from '@/lib/textOnPath'

gsap.registerPlugin(ScrollTrigger)

const sceneRef  = ref<HTMLElement | null>(null)
const heroRef   = ref<HTMLElement | null>(null)
const svgEl     = ref<SVGElement | null>(null)
const serviceStore = useServiceStore()

const { service } = storeToRefs(serviceStore)
const taglines = computed(() => [
    service.value?.Tagline01 ?? '',
    service.value?.Tagline02 ?? '',
    service.value?.Tagline03 ?? '',
    service.value?.Tagline04 ?? '',
])

const offsets   = ref([...CIRCULAR_BASE_OFFSETS])
const opacities = ref([0, 0, 0, 0])
const scale     = ref(1.15)

const isMobile        = window.innerWidth <= 900
const mobileSvgWs     = circularMobileSvgWidths(window.innerWidth)
const mobileFontSizes = circularMobileFontSizes(window.innerWidth)
const desktopPath     = CIRCULAR_DESKTOP_PATH
const mobilePath      = CIRCULAR_MOBILE_PATH
const svgWidths       = CIRCULAR_SVG_WIDTHS
const fontSizes       = CIRCULAR_FONT_SIZES

onMounted(async () => {
    await serviceStore.fetchService()
    await nextTick()

    const svg = heroRef.value?.querySelector('svg') as SVGElement | null
    svgEl.value = svg
    gsap.set(svg, { opacity: 0, scaleX: 0.18, scaleY: 0.18 })

    // ── Entrance animation ────────────────────────────────────────────────────
    const taglineSvgs  = Array.from(sceneRef.value?.querySelectorAll('.tagline-items svg') ?? [])
    const textPaths    = Array.from(sceneRef.value?.querySelectorAll('.tagline-items textPath') ?? [])
    const textEls      = Array.from(sceneRef.value?.querySelectorAll('.tagline-items text') ?? [])
    const heroPaths    = Array.from(heroRef.value?.querySelectorAll('path') ?? [])

    let entranceDone = false
    const entryTl = gsap.timeline({ delay: 0.2, onComplete: () => { entranceDone = true } })
    taglineSvgs.forEach((el, i) => {
        const baseOffset = CIRCULAR_BASE_OFFSETS[i] ?? 0
        const proxy = { v: 0 }
        entryTl.to(proxy, {
            v: 1,
            duration: 0.8,
            ease: 'power2.out',
            onUpdate: () => { opacities.value[i] = proxy.v },
            onComplete: () => { opacities.value[i] = 1 },
        }, i * 0.15)
        if (textPaths[i]) {
            entryTl.from(textPaths[i], {
                attr: { startOffset: `${baseOffset - 15}%` },
                duration: 1.4,
                ease: 'power3.out',
            }, i * 0.15)
        }
    })
    entryTl.to(svg, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.5)

    const lenisUpdate = () => ScrollTrigger.update()
    lenis.on('scroll', lenisUpdate)

    const st = ScrollTrigger.create({
        trigger: sceneRef.value,
        start: 'top top',
        end: '+=1000vh',
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
            const p = self.progress

            offsets.value = CIRCULAR_BASE_OFFSETS.map((base, i) => base + p * (CIRCULAR_TRAVEL_OFFSETS[i] ?? 0))
            scale.value   = 1.15 + Math.min(Math.max((p - 0.5) / 0.5, 0), 1) * 4

            if (entranceDone) {
                const fadeProgress = Math.min(Math.max((p - 0.3) / 0.7, 0), 1)
                const alpha = 1 - fadeProgress
                gsap.set(textEls, { fill: `rgba(255, 77, 251, ${alpha})` })
                gsap.set(heroPaths, { fillOpacity: alpha })
            }

            if (svgEl.value) {
                const scaleProgress = Math.min(Math.max((p - 0.5) / 0.5, 0), 1)
                gsap.to(svgEl.value, { scaleX: 0.18 + scaleProgress * 0.82, scaleY: 0.18 + scaleProgress * 0.57, duration: 0.1, overwrite: 'auto' })
            }
        },
    })

    onUnmounted(() => {
        st.kill()
        lenis.off('scroll', lenisUpdate)
    })
})
</script>

<template>
    <section>
        <div class="scene" ref="sceneRef">
            <div class="tagline-items">
                <svg viewBox="0 0 100 100" :width="isMobile ? mobileSvgWs[0] : 600" :height="isMobile ? mobileSvgWs[0] : 600" :style="{ transform: `scale(${scale})`, opacity: opacities[0] }">
                    <defs><path id="cp1" :d="isMobile ? mobilePath : desktopPath" /></defs>
                    <text :font-size="isMobile ? mobileFontSizes[0] : fontSizes[0]" fill="#FF4DFB">
                        <textPath href="#cp1" :startOffset="`${offsets[0]}%`">{{ taglines[0] }}</textPath>
                    </text>
                </svg>
                <svg viewBox="0 0 100 100" :width="isMobile ? mobileSvgWs[1] : 700" :height="isMobile ? mobileSvgWs[1] : 700" :style="{ transform: `scale(${scale})`, opacity: opacities[1] }">
                    <defs><path id="cp2" :d="isMobile ? mobilePath : desktopPath" /></defs>
                    <text :font-size="isMobile ? mobileFontSizes[1] : fontSizes[1]" fill="#FF4DFB">
                        <textPath href="#cp2" :startOffset="`${offsets[1]}%`">{{ taglines[1] }}</textPath>
                    </text>
                </svg>
                <svg viewBox="0 0 100 100" :width="isMobile ? mobileSvgWs[2] : 800" :height="isMobile ? mobileSvgWs[2] : 800" :style="{ transform: `scale(${scale})`, opacity: opacities[2] }">
                    <defs><path id="cp3" :d="isMobile ? mobilePath : desktopPath" /></defs>
                    <text :font-size="isMobile ? mobileFontSizes[2] : fontSizes[2]" fill="#FF4DFB">
                        <textPath href="#cp3" :startOffset="`${offsets[2]}%`">{{ taglines[2] }}</textPath>
                    </text>
                </svg>
                <svg viewBox="0 0 100 100" :width="isMobile ? mobileSvgWs[3] : 900" :height="isMobile ? mobileSvgWs[3] : 900" :style="{ transform: `scale(${scale})`, opacity: opacities[3] }">
                    <defs><path id="cp4" :d="isMobile ? mobilePath : desktopPath" /></defs>
                    <text :font-size="isMobile ? mobileFontSizes[3] : fontSizes[3]" fill="#FF4DFB">
                        <textPath href="#cp4" :startOffset="`${offsets[3]}%`">{{ taglines[3] }}</textPath>
                    </text>
                </svg>
            </div>
            <div class="hero" ref="heroRef">
                <MainPath />
            </div>
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
    </section>
</template>


<style scoped>
section {
    overflow: hidden;
}

.scene {
    position: relative;
    width: 100vw;
    height: 100vh;
}

.tagline-items {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    margin-left: -5.5em;
}

.tagline-items svg {
    position: absolute;
    color: currentColor;
    transform-origin: center;
    transform-box: fill-box;
}

.hero {
    position: absolute;
    inset: 0;
    z-index: 2;
    padding-left: 2em;
}

.hero svg {
    display: block;
    width: 100%;
    height: 100%;
    color: currentColor;
}

.col {
    margin-bottom: 18em;
    padding: 2em;
    display: flex;
    margin-top: -10em;
    div:first-child {
        flex: 0.95;
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

@media (max-width: 900px) {
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
