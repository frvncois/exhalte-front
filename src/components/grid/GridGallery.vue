<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import lenis from '@/lib/lenis'
import { registerPageLeave } from '@/transitions/projectTransition'

const sectionRef = ref(null)
const observers = []
let unregisterLeave = null
onBeforeUnmount(() => unregisterLeave?.())
const PARALLAX_FACTORS = [0.08, -0.06, 0.1, -0.08, 0.06, -0.1, 0.07, -0.05, 0.09]

onMounted(() => {
    const lis = sectionRef.value?.querySelectorAll('li')
    if (!lis) return

    const onScroll = () => {
        lis.forEach((li, i) => {
            const factor = PARALLAX_FACTORS[i % PARALLAX_FACTORS.length]
            const rect = li.getBoundingClientRect()
            const center = rect.top + rect.height / 2 - window.innerHeight / 2
            gsap.set(li, { y: center * factor })
        })
    }
    lenis.on('scroll', onScroll)
    observers.push({ disconnect: () => lenis.off('scroll', onScroll) })

    lis.forEach(li => {
        const cover = li.querySelector('.cover')
        gsap.set(cover, { clipPath: 'inset(0 0 100% 0)' })

        const obs = new IntersectionObserver(([entry]) => {
            if (!entry?.isIntersecting) return
            gsap.to(cover, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power3.out' })
            obs.disconnect()
        }, { threshold: 0.2 })

        obs.observe(li)
        observers.push(obs)
    })
})

onUnmounted(() => observers.forEach(obs => obs.disconnect()))

onMounted(() => {
    unregisterLeave = registerPageLeave((done) => {
        const covers = sectionRef.value?.querySelectorAll('.cover')
        if (!covers?.length) { done(); return }
        gsap.timeline({ onComplete: done }).to(covers, { clipPath: 'inset(0 0 100% 0)', duration: 0.4, stagger: 0.02, ease: 'power2.in' })
    })
})

const props = defineProps({
    items: {
        type: Array,
        default: () => []
    }
})

// Grid positions per 12-column × 12-row block [rowStart, colStart, rowEnd, colEnd]
const POSITIONS = [
    [1,  1,  2,  4],
    [2,  4,  4,  8],
    [3,  9,  5,  13],
    [5,  5,  7,  7],
    [6,  9,  7,  12],
    [7,  2,  9,  4],
    [8,  7,  10, 12],
    [10, 4,  12, 7],
    [11, 11, 13, 12],
]

const BLOCK_ROWS = 12

function getGridStyle(index) {
    const patternIndex = index % POSITIONS.length
    const cycle = Math.floor(index / POSITIONS.length)
    const [rs, cs, re, ce] = POSITIONS[patternIndex]
    const offset = cycle * BLOCK_ROWS
    return { gridArea: `${rs + offset} / ${cs} / ${re + offset} / ${ce}` }
}

function totalRows(count) {
    return Math.ceil(count / POSITIONS.length) * BLOCK_ROWS
}
</script>

<template>
    <section ref="sectionRef">
        <ul :style="{ gridTemplateRows: `repeat(${totalRows(items.length)}, var(--cell))` }">
            <li
                v-for="(item, index) in items"
                :key="item.id ?? index"
                :style="getGridStyle(index)"
            >
                <div class="cover">
                    <img
                        :src="item.formats?.large?.url ?? item.url"
                        :alt="item.alternativeText ?? ''"
                    />
                </div>
            </li>
        </ul>
    </section>
</template>

<style scoped>
section {
    box-sizing: border-box;
    width: 100vw;
    padding: 8em 2em;
}

ul {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 2em;
}

li {
    display: flex;
    min-height: 0;
    &:nth-child(1) .cover{ aspect-ratio: 9/12; }
    &:nth-child(2) .cover{ aspect-ratio: 4/5; }
    &:nth-child(3) .cover{ aspect-ratio: 2/3; }
    &:nth-child(4) .cover{ aspect-ratio: 2/3; }
    &:nth-child(5) .cover{ aspect-ratio: 3/4; }
    &:nth-child(6) .cover{ aspect-ratio: 1/1; }
    &:nth-child(7) .cover{ aspect-ratio: 16/9; }
    &:nth-child(8) .cover{ aspect-ratio: 9/16; }
    &:nth-child(9) .cover{ aspect-ratio: 16/9; }
}

.cover {
    background-color: black;
    flex: 1;
    height: 100%;
    overflow: hidden;
}

img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

@media (max-width: 640px) {
    ul {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: none !important;
        gap: 1rem;
    }

    li {
        grid-area: auto !important;
        min-height: 200px;
    }
}
</style>
