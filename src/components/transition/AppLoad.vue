<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { APPLOAD_COPIES, APPLOAD_PATH_1, APPLOAD_PATH_2 } from '@/lib/textOnPath'
import { useLocaleStore } from '@/stores/locale'

const emit = defineEmits(['ready', 'done'])

const localeStore = useLocaleStore()
const phrase = localeStore.locale === 'en' ? 'Movement as method' : 'Le mouvement est une pensée'
const COPIES = APPLOAD_COPIES
const sectionRef = ref<HTMLElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const group1Ref = ref<SVGGElement | null>(null)
const group2Ref = ref<SVGGElement | null>(null)
const offsets = ref<number[]>([])

onMounted(async () => {
    if (!svgRef.value) return

    await document.fonts.ready

    const testEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    testEl.setAttribute('font-size', '10')
    testEl.setAttribute('font-family', 'body')
    testEl.style.visibility = 'hidden'
    testEl.textContent = phrase
    svgRef.value.appendChild(testEl)
    svgRef.value.removeChild(testEl)

    const pathEl = svgRef.value.querySelector('#textPath') as SVGPathElement
    const pathLength = pathEl.getTotalLength()

    offsets.value = Array.from({ length: COPIES }, (_, i) => (i / COPIES) * pathLength)
    await nextTick()

    const pathEl2 = svgRef.value.querySelector('#textPath2') as SVGPathElement
    const pathLength2 = pathEl2.getTotalLength()

    const tp1 = Array.from(group1Ref.value!.querySelectorAll('textPath'))
    const tp2 = Array.from(group2Ref.value!.querySelectorAll('textPath'))

    const tl = gsap.timeline()
    tl.to(sectionRef.value, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    tl.from(svgRef.value, { opacity: 0, duration: 0.6 })
    tl.to(tp1, {
        attr: { startOffset: (_i: number) => offsets.value[_i]! + pathLength },
        duration: 6,
        ease: 'power2.in'
    }, 0)
    tl.to(tp2, {
        attr: { startOffset: (_i: number) => offsets.value[_i]! - pathLength2 },
        duration: 6,
        ease: 'power2.in'
    }, 0)
    tl.to(sectionRef.value, { opacity: 0, duration: 0.5, ease: 'power2.in', onStart: () => emit('ready'), onComplete: () => emit('done') })
})
</script>

<template>
    <section ref="sectionRef">
        <div class="lines">
            <svg ref="svgRef" viewBox="0 0 658 472" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <path id="textPath" :d="APPLOAD_PATH_1" />
                    <path id="textPath2" :d="APPLOAD_PATH_2" />
                </defs>
                <g ref="group1Ref" transform="translate(-5, 0)">
                    <text v-for="(offset, i) in offsets" :key="i">
                        <textPath href="#textPath" :startOffset="offset">{{ phrase }}</textPath>
                    </text>
                </g>
                <g ref="group2Ref" transform="translate(5, 0)">
                    <text v-for="(offset, i) in offsets" :key="i">
                        <textPath href="#textPath2" :startOffset="offset">{{ phrase }}</textPath>
                    </text>
                </g>
            </svg>
        </div>
    </section>
</template>

<style scoped>
section {
    position: fixed;
    inset: 0;
    opacity: 0;
    background: var(--framboise);
    color: var(--pink);
    z-index: 100;
}

text {
    font-family: 'body';
    font-size: 10px;
    fill: var(--pink);
    stroke-width: 2px;
    paint-order: stroke fill;
    stroke: var(--framboise);
    text-transform: uppercase;
    dominant-baseline: hanging;
}

.lines {
    position: fixed;
    inset: 0;
    svg {
        width: 100%;
        height: 100%;
    }
}
</style>
