<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits(['ready'])
import { gsap } from 'gsap'

const phrase = '/Le mouvement est une pensée'
const repeat = phrase.repeat(50)

const show = ref(!document.body.classList.contains('app-loaded'))
const sectionRef = ref<HTMLElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const textPathRef = ref<SVGTextPathElement | null>(null)

onMounted(async () => {
    if (!show.value || !svgRef.value) return
    document.body.classList.add('app-loaded')

    await document.fonts.ready

    const testEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    testEl.setAttribute('font-size', '10')
    testEl.setAttribute('font-family', 'body')
    testEl.style.visibility = 'hidden'
    testEl.textContent = phrase
    svgRef.value.appendChild(testEl)
    const oneRepeatLength = testEl.getComputedTextLength()
    svgRef.value.removeChild(testEl)

    const animEl = document.createElementNS('http://www.w3.org/2000/svg', 'animate')
    animEl.setAttribute('attributeName', 'startOffset')
    animEl.setAttribute('from', String(-oneRepeatLength * 5))
    animEl.setAttribute('to', String(-oneRepeatLength * 5 + oneRepeatLength))
    animEl.setAttribute('dur', '5s')
    animEl.setAttribute('repeatCount', 'indefinite')
    textPathRef.value!.appendChild(animEl)

    const tl = gsap.timeline()
    tl.to(sectionRef.value, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    tl.from(svgRef.value, { opacity: 0, duration: 0.6 })
    tl.to(sectionRef.value, { opacity: 0, duration: 0.5, delay: 3, onComplete: () => { show.value = false; emit('ready') } })
})
</script>

<template>
    <section v-if="show" ref="sectionRef">
        <svg ref="svgRef" viewBox="0 0 658 472" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <defs>
                <path id="textPath" d="M328.408 0.0610046C323.408 40.7277 276.308 122.061 127.908 122.061C-57.5919 122.061 -25.5919 29.061 127.908 29.061C281.408 29.061 328.408 111.561 328.408 155.061C328.408 198.561 280.908 281.061 127.908 281.061C-25.0919 281.061 -49.5919 187.561 127.908 187.561C305.408 187.561 328.408 302.061 328.408 316.561C328.408 331.061 305.408 445.061 127.908 445.061C-49.5919 445.061 -29.0919 351.061 127.908 351.061C284.908 351.061 328.408 440.561 328.408 470.561H329.501C329.501 440.561 373.001 351.061 530.001 351.061C687.001 351.061 707.501 445.061 530.001 445.061C352.501 445.061 329.501 331.061 329.501 316.561C329.501 302.061 352.501 187.561 530.001 187.561C707.501 187.561 683.001 281.061 530.001 281.061C377.001 281.061 329.501 198.561 329.501 155.061C329.501 111.561 376.501 29.061 530.001 29.061C683.501 29.061 715.501 122.061 530.001 122.061C381.601 122.061 334.501 40.7277 329.501 0.0610046"/>
            </defs>
            <text>
                <textPath ref="textPathRef" href="#textPath">{{ repeat }}</textPath>
            </text>
        </svg>
    </section>
</template>

<style scoped>
section {
    position: fixed;
    inset: 0;
    opacity: 0;
    background: var(--lime);
    color: var(--olive);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
}
svg {
    width: 100%;
    height: 100%;
}
text {
    font-family: 'body';
    font-size: 10px;
    fill: var(--olive);
    stroke-width: 2px;
    paint-order: stroke fill;
    stroke: var(--lime);
    text-transform: uppercase;
    dominant-baseline: central;
}
</style>
