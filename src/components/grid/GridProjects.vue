<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { captureFwdClones, getFwdClones, getRevClones, getClickedIndex } from '@/transitions/projectTransition'

const router = useRouter()
const ulEl = ref<HTMLUListElement | null>(null)

function handleClick(index: number) {
    const lis = Array.from(ulEl.value!.querySelectorAll('li')) as HTMLElement[]
    const li = lis[index]!
    const otherLis = lis.filter((_, i) => i !== index)

    captureFwdClones(
        index,
        li.querySelector('.cover')!,
        li.querySelector('span')!,
        li.querySelector('.title')!,
        otherLis.map(l => ({
            cover: l.querySelector('.cover')!,
            details: l.querySelector('.details')!,
        })),
    )

    const fwdClones = getFwdClones()

    // Hide p in the clicked title clone — SingleView doesn't show it
    const titleClone = fwdClones[2]
    const pInTitle = titleClone?.querySelector('p') as HTMLElement | null
    if (pInTitle) pInTitle.style.display = 'none'

    // Fix lost scoped styles in other lis' details clones
    otherLis.forEach((_, i) => {
        const detailsClone = fwdClones[3 + i * 2 + 1]
        if (!detailsClone) return
        const title = detailsClone.querySelector('.title') as HTMLElement | null
        if (title) Object.assign(title.style, { display: 'flex', flexDirection: 'column', gap: '0.25em' })
        const h2 = detailsClone.querySelector('h2') as HTMLElement | null
        if (h2) h2.style.fontSize = 'var(--text-regular)'
        const p = detailsClone.querySelector('p') as HTMLElement | null
        if (p) Object.assign(p.style, { fontSize: 'var(--text-sm)', textTransform: 'uppercase' })
    })

    router.push('/single')
}

onMounted(() => {
    const clones = getRevClones()

    if (!clones.length) {
        const lis = Array.from(ulEl.value!.querySelectorAll('li'))
        gsap.from(lis, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'power2.out', stagger: 0.08 })
        return
    }

    if (!ulEl.value) return

    const lis = Array.from(ulEl.value.querySelectorAll('li')) as HTMLElement[]
    const idx = Math.max(0, getClickedIndex())
    const clickedLi = lis[idx]!
    const otherLis = lis.filter((_, i) => i !== idx)

    // Hide only covers — text stays visible throughout
    const clickedCover = clickedLi.querySelector('.cover') as HTMLElement
    const clickedSpan = clickedLi.querySelector('span') as HTMLElement
    const clickedTitle = clickedLi.querySelector('.title') as HTMLElement
    gsap.set([clickedCover, clickedSpan, clickedTitle], { opacity: 0 })
    otherLis.forEach(li => gsap.set(li.querySelector('.cover'), { opacity: 0 }))

    function flyTo(clone: HTMLElement, dest: DOMRect, delay = 0, onDone?: () => void) {
        gsap.to(clone, {
            x: dest.left - parseFloat(clone.style.left),
            y: dest.top - parseFloat(clone.style.top),
            scaleX: dest.width / parseFloat(clone.style.width),
            scaleY: dest.height / parseFloat(clone.style.height),
            duration: 0.75,
            ease: 'power3.inOut',
            delay,
            onComplete: () => { clone.remove(); onDone?.() },
        })
    }

    // [0] cover → clicked li cover
    flyTo(clones[0]!, clickedCover.getBoundingClientRect(), 0,
        () => gsap.set(clickedCover, { opacity: 1 }))

    // [1] span, [2] title → clicked li text (position only, no scale)
    ;[
        { clone: clones[1]!, el: clickedSpan },
        { clone: clones[2]!, el: clickedTitle },
    ].forEach(({ clone, el }) => {
        const dest = el.getBoundingClientRect()
        gsap.to(clone, {
            x: dest.left - parseFloat(clone.style.left),
            y: dest.top - parseFloat(clone.style.top),
            duration: 0.75,
            ease: 'power3.inOut',
            onComplete: () => { clone.remove(); gsap.set(el, { opacity: 1 }) },
        })
    })

    // [3+] interleaved: cover + info per other li
    otherLis.forEach((li, i) => {
        const cover = li.querySelector('.cover') as HTMLElement
        const details = li.querySelector('.details') as HTMLElement
        const coverClone = clones[3 + i * 2]
        const infoClone = clones[3 + i * 2 + 1]

        // Cover: hide and reveal when clone lands
        if (coverClone) {
            flyTo(coverClone, cover.getBoundingClientRect(), i * 0.04,
                () => gsap.set(cover, { opacity: 1 }))
        } else {
            gsap.set(cover, { opacity: 1 })
        }

        // Details: animate actual element from SharedProject position — same as clicked project
        if (infoClone) {
            const dest = details.getBoundingClientRect()
            const fromX = parseFloat(infoClone.style.left) - dest.left
            const fromY = parseFloat(infoClone.style.top)  - dest.top
            infoClone.remove()
            gsap.from(details, { x: fromX, y: fromY, duration: 0.75, ease: 'power3.inOut', delay: i * 0.04 })
        }
    })
})
</script>

<template>
    <section>
        <ul ref="ulEl">
            <li v-for="(_, index) in 6" :key="index" @click="handleClick(index)">
                <div class="cover"></div>
                <div class="details" style="display:flex;flex-direction:column;justify-content:space-between;flex:1;">
                    <span>{{ String(index + 1).padStart(2, '0') }}</span>
                    <div class="title">
                        <h2>Project Title</h2>
                        <p>Lorem ipsum</p>
                    </div>
                </div>
            </li>
        </ul>
    </section>
</template>

<style scoped>
section {
    display: flex;
    height: 100vh;
    align-items: end;
    justify-content: stretch;
}

ul {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    column-gap: 2em;
    row-gap: 6em;
    flex: 1;
}

li {
    display: flex;
    gap: 1rem;
    position: relative;
}

h2, h3 {
    font-size: var(--text-regular);
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

.details {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
}

.title {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
}
</style>
