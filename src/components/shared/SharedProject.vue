<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { getFwdClones } from '@/transitions/projectTransition'
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'

const { type } = storeToRefs(useProjectStore())

const spanRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const ulRef = ref<HTMLElement | null>(null)

onMounted(() => {
    const clones = getFwdClones()

    if (!clones.length) {
        const lis = ulRef.value ? Array.from(ulRef.value.querySelectorAll('li')) : []
        const els = [spanRef.value, titleRef.value, ...lis].filter(Boolean)
        gsap.from(els, {
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.1,
        })
        return
    }

    function flyClone(clone: HTMLElement, el: HTMLElement, delay = 0, withScale = false) {
        const dest = el.getBoundingClientRect()
        gsap.set(el, { opacity: 0 })
        gsap.to(clone, {
            x: dest.left - parseFloat(clone.style.left),
            y: dest.top - parseFloat(clone.style.top),
            ...(withScale && {
                scaleX: dest.width / parseFloat(clone.style.width),
                scaleY: dest.height / parseFloat(clone.style.height),
            }),
            duration: 0.8,
            ease: 'power3.inOut',
            delay,
            onComplete: () => { clone.remove(); gsap.set(el, { opacity: 1 }) },
        })
    }

    if (clones[1] && spanRef.value)  flyClone(clones[1], spanRef.value)
    if (clones[2] && titleRef.value) flyClone(clones[2], titleRef.value, 0.04)

    if (ulRef.value) {
        const ulLis = Array.from(ulRef.value.querySelectorAll('li')) as HTMLElement[]
        ulLis.forEach((li, i) => {
            const cover = li.querySelector('.cover') as HTMLElement
            const info = li.querySelector('.info') as HTMLElement
            const coverClone = clones[3 + i * 2]
            const infoClone = clones[3 + i * 2 + 1]
            const delay = 0.06 + i * 0.04
            if (coverClone) flyClone(coverClone, cover, delay, true)
            if (infoClone) {
                const dest = info.getBoundingClientRect()
                const fromX = parseFloat(infoClone.style.left) - dest.left
                const fromY = parseFloat(infoClone.style.top)  - dest.top
                infoClone.remove()
                gsap.from(info, { x: fromX, y: fromY, duration: 0.8, ease: 'power3.inOut', delay })
            }
        })
    }
})
</script>

<template>
    <section :class="{ 'is-gallery': type === 'gallery' }">
        <div CLAS>
            <span ref="spanRef" data-trans="span">01</span>
        </div>
        <div class="details">
            <div class="title" ref="titleRef" data-trans="title">
                <h2>Project Title</h2>
                <p>Lorem ipsum</p>
            </div>
            <ul ref="ulRef" data-trans="ul">
               <li v-for="n in 5" :key="n">
                    <div class="cover"></div>
                    <div class="info">
                        <span>0{{ n }}</span>
                        <h3>Project title</h3>
                    </div>
               </li>
            </ul>
        </div>
    </section>
</template>

<style scoped>
section {
    display: flex;
    flex-direction: column;
    padding: 2em;
    gap: 4em;
}

section.is-gallery {
    position: sticky;
    top: 5em;
    align-self: flex-start;
    flex-direction: row;
    .details {
        display: flex;
        flex-direction: column;
        & ul {
            display: flex;
            flex-direction: column!important;
        }
    }
}

.details {
    display: flex;
}

.title {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25em;
}

ul {
    flex: 1;
    display: flex;
    gap: 1em;
}

li {
    display: flex;
    flex: 1;
    gap: 0.75em;
    cursor: pointer;
    transition: transform 0.3s ease;
}

h2 {
    font-size: var(--text-regular);
    white-space: nowrap;
}

h3 {
    font-size: var(--text-regular);
    white-space: nowrap;
    position: absolute;
    bottom: 0;
    display: none;
}

p {
    font-size: var(--text-sm);
    text-transform: uppercase;
}

.cover {
    background-color: black;
    aspect-ratio: 4/3;
    flex: 1;
}

.info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.25em;
    padding-bottom: 0.25em;
    position: relative;
}

</style>
