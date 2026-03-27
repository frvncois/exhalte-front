<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import MainLogo from '@/assets/MainLogo.vue'
import MainIcon from '@/assets/MainIcon.vue'
import SharedHeader from '../shared/SharedHeader.vue'

const emit = defineEmits(['ready'])

const phrase = ' / Le mouvement est une pensée'
const COPIES = 14
const show = ref(!document.body.classList.contains('app-loaded'))
const sectionRef = ref<HTMLElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const group1Ref = ref<SVGGElement | null>(null)
const group2Ref = ref<SVGGElement | null>(null)
const splashRef = ref<HTMLElement | null>(null)
const offsets = ref<number[]>([])

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
    }, '+=0.2')
    tl.to(tp2, {
        attr: { startOffset: (_i: number) => offsets.value[_i]! - pathLength2 },
        duration: 6,
        ease: 'power2.in'
    }, '<')
    const logoSvg = splashRef.value!.querySelector(':scope > svg')
    tl.to(sectionRef.value, { backgroundColor: 'var(--medium)', color: 'var(--pink)', duration: 0.8, ease: 'power2.inOut' })
    tl.to(splashRef.value, { opacity: 1, duration: 0.8, ease: 'power2.out' }, '<')
    tl.fromTo(logoSvg, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power3.out' }, '<')

    const exit = () => {
        sectionRef.value?.removeEventListener('click', exit)
        gsap.to(sectionRef.value, { opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: () => { show.value = false; emit('ready') } })
    }
    sectionRef.value?.addEventListener('click', exit)
})
</script>

<template>
    <section v-if="show" ref="sectionRef">
        <div class="lines">
            <svg ref="svgRef" viewBox="0 0 658 472" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <path id="textPath" d="M328.408 0.0610046C323.408 40.7277 276.308 122.061 127.908 122.061C-57.5919 122.061 -25.5919 29.061 127.908 29.061C281.408 29.061 328.408 101.5 328.408 155.061C328.408 208.622 280.908 281.061 127.908 281.061C-25.0919 281.061 -49.5919 187.561 127.908 187.561C294 187.561 328.408 272.122 328.408 316.561C328.408 361 289 445.061 127.908 445.061C-49.5919 445.061 -29.0919 351.061 127.908 351.061C284.908 351.061 328.408 440.561 328.408 470.561" />
                    <path id="textPath2" d="M329.592 0.0610046C334.592 40.7277 381.692 122.061 530.092 122.061C715.5919 122.061 683.5919 29.061 530.092 29.061C376.592 29.061 329.592 101.5 329.592 155.061C329.592 208.622 377.092 281.061 530.092 281.061C683.0919 281.061 707.5919 187.561 530.092 187.561C364 187.561 329.592 272.122 329.592 316.561C329.592 361 369 445.061 530.092 445.061C707.5919 445.061 687.0919 351.061 530.092 351.061C373.092 351.061 329.592 440.561 329.592 470.561" />
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
        <div class="splash" ref="splashRef">
            <SharedHeader/>
            <MainLogo/>
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
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
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
    .splash {
        position: fixed;
        inset: 0;
        padding: 2em;
        opacity: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: end;

        > div {
            flex: 1;
            display: flex;
            align-items: center;
            text-align: center;
            p {
                font-size: var(--text-medium);
                font-family: heading;
            }
        }
    }
    .splash :deep(section) {
      position: absolute;
      top: 0;                          
  }   
</style>
