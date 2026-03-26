<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import lenis from '@/lib/lenis'
import { useServiceStore } from '@/stores/service'
import { storeToRefs } from 'pinia'

const { service } = storeToRefs(useServiceStore())
const taglines = computed(() => [
    service.value?.Tagline01 ?? '',
    service.value?.Tagline02 ?? '',
    service.value?.Tagline03 ?? '',
    service.value?.Tagline04 ?? '',
])

const sectionRef = ref<HTMLElement | null>(null)

// Base rotations matching the CSS values the user set
const baseAngles  = [20, 80, 130, 160]
// Each circle gets a distinct travel amount
const travelDegs  = [40, 65, 30, 55]
const angles      = ref([...baseAngles])
const opacities   = ref([0, 0, 0, 0])
const scale       = ref(1)
const progress    = ref(0)

// SVG widths in px — used to compute font-size so physical text size stays constant.
// Each SVG has viewBox="0 0 100 100", so scale = width / 100.
// To keep text at ~14px regardless of circle size: font-size = 14 / scale = 1400 / width
const svgWidths   = [600, 700, 800, 900]
const targetPx    = 18
const fontSizes   = svgWidths.map(w => +(targetPx / (w / 100)).toFixed(3))

const fadeStarts  = [0, 0.08, 0.18, 0.28]
const fadeDur     = 0.25

onMounted(() => {
    const onScroll = () => {
        if (!sectionRef.value) return
        const parent = sectionRef.value.parentElement!
        const { top } = parent.getBoundingClientRect()
        const scrollRange = parent.offsetHeight - window.innerHeight
        if (scrollRange <= 0) return
        const p = Math.min(Math.max(-top / scrollRange, 0), 1)

        progress.value  = p
        angles.value    = baseAngles.map((base, i) => base + p * (travelDegs[i] ?? 0))
        opacities.value = fadeStarts.map(start => Math.min(Math.max((p - start) / fadeDur, 0), 1))
        scale.value     = 1 + Math.min(Math.max((p - 0.7) / 0.3, 0), 1) * 4
    }

    lenis.on('scroll', onScroll)
    onUnmounted(() => lenis.off('scroll', onScroll))
})

defineExpose({ progress })
</script>

<template>
    <div class="tagline-wrap">
        <section ref="sectionRef">
            <div class="tagline-items">
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

        </section>
    </div>
</template>

<style scoped>
.tagline-wrap {
    height: 150vh;
    position: relative;
}
.tagline-items {
    position: relative;
    height: 100vh;
    top: -2.5em;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

section {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

svg {
    position: absolute;
    color: currentColor;
}
</style>
