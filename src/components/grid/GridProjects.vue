<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import { captureFwdClones, getFwdClones, getRevClones, getClickedIndex, registerPageLeave } from '@/transitions/projectTransition'
import { useProjectStore } from '@/stores/project'
import { slugify, coverImage } from '@/api/strapi'
import lenis from '@/lib/lenis'

const router = useRouter()
const ulEl = ref<HTMLUListElement | null>(null)

function coverUrl(project: typeof projects.value[number]): string | null {
    const img = coverImage(project)
    if (!img) return null
    return img.formats?.large?.url ?? img.url
}
const projectStore = useProjectStore()
const { projects, activeProject } = storeToRefs(projectStore)

let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

function handleClick(index: number) {
    const project = projects.value[index]
    if (!project) return

    lenis.stop()
    projectStore.setActiveSlug(slugify(project.Title))

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

    // Fix title clone: GridProjects has no justify-content, SharedProject has justify-content: end
    const titleClone = fwdClones[2]
    if (titleClone) titleClone.style.justifyContent = 'flex-end'

    // Details clones are position markers only — hide them to avoid duplicate h2 flicker
    otherLis.forEach((_, i) => {
        const detailsClone = fwdClones[3 + i * 2 + 1]
        if (detailsClone) detailsClone.style.opacity = '0'
    })

    router.push(`/projects/${slugify(project.Title)}`)
}

onMounted(async () => {
    gsap.set(ulEl.value, { visibility: 'hidden' })
    await projectStore.fetchProjects()

    const clones = getRevClones()

    unregisterLeave = registerPageLeave((done) => {
        if (getFwdClones().length) { done(); return }
        const lis = Array.from(ulEl.value?.querySelectorAll('li') ?? [])
        gsap.timeline({ onComplete: done }).to(lis, { clipPath: 'inset(0 0 100% 0)', duration: 0.4, stagger: 0.05, ease: 'power2.in' })
    })

    if (!clones.length) {
        await nextTick()
        gsap.set(ulEl.value, { visibility: 'visible' })
        const lis = Array.from(ulEl.value!.querySelectorAll('li'))
        gsap.from(lis, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'power2.out', stagger: 0.08 })
        return
    }

    if (!ulEl.value) return

    await nextTick()
    gsap.set(ulEl.value, { visibility: 'visible' })

    const lis = Array.from(ulEl.value.querySelectorAll('li')) as HTMLElement[]
    const activeIdx = projects.value.findIndex(p => p.documentId === activeProject.value?.documentId)
    const idx = Math.max(0, activeIdx >= 0 ? activeIdx : getClickedIndex())
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
            width: dest.width,
            height: dest.height,
            duration: 1.4,
            ease: 'power3.inOut',
            delay,
            onComplete: () => { clone.remove(); onDone?.() },
        })
    }

    // [0] cover → clicked li cover
    flyTo(clones[0]!, clickedCover.getBoundingClientRect(), 0,
        () => { gsap.set(clickedCover, { opacity: 1 }); lenis.start() })

    // [1] span → position only
    if (clones[1]) {
        const dest = clickedSpan.getBoundingClientRect()
        gsap.to(clones[1], {
            x: dest.left - parseFloat(clones[1].style.left),
            y: dest.top - parseFloat(clones[1].style.top),
            duration: 1.4,
            ease: 'power3.inOut',
            onComplete: () => { clones[1]!.remove(); gsap.set(clickedSpan, { opacity: 1 }) },
        })
    }

    // [2] title → animate position + resize so justify-content: end flows naturally (no instant jump)
    if (clones[2]) {
        const dest = clickedTitle.getBoundingClientRect()
        gsap.to(clones[2], {
            x: dest.left - parseFloat(clones[2].style.left),
            y: dest.top - parseFloat(clones[2].style.top),
            width: dest.width,
            height: dest.height,
            duration: 1.4,
            ease: 'power3.inOut',
            delay: 0.04,
            onComplete: () => { clones[2]!.remove(); gsap.set(clickedTitle, { opacity: 1 }) },
        })
    }

    // [3+] interleaved: cover + info per other li
    otherLis.forEach((li, i) => {
        const cover = li.querySelector('.cover') as HTMLElement
        const details = li.querySelector('.details') as HTMLElement
        const coverClone = clones[3 + i * 2]
        const infoClone = clones[3 + i * 2 + 1]

        // Cover: hide and reveal when clone lands
        if (coverClone) {
            flyTo(coverClone, cover.getBoundingClientRect(), 0.06 + i * 0.04,
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
            gsap.from(details, { x: fromX, y: fromY, duration: 1.2, ease: 'power3.inOut', delay: 0.06 + i * 0.04 })
        }
    })
})
</script>

<template>
    <section>
        <ul ref="ulEl">
            <li v-for="(project, index) in projects" :key="project.documentId" @click="handleClick(index)">
                <div class="cover">
                    <img v-if="coverUrl(project)" :src="coverUrl(project)!" :alt="project.Title" />
                </div>
                <div class="details">
                    <span>{{ String(index + 1).padStart(2, '0') }}</span>
                    <div class="title">
                        <h2>{{ project.Title }}</h2>
                        <p v-if="project.Subtitle">{{ project.Subtitle }}</p>
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
    li {
        display: flex;
        gap: 1rem;
        position: relative;
        cursor: pointer;
    }
}

h2, h3 {
    font-size: var(--text-regular);
    white-space: nowrap;
}

p {
    font-size: var(--text-sm);
    text-transform: uppercase;
}

.cover {
    background-color: var(--black);
    aspect-ratio: 4/3;
    flex: 1;
    overflow: hidden;
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
}

.details {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    transition: opacity 0.4s ease;
}

li:hover .details {
    opacity: 0.5;
}

.title {
    display: flex;
    flex-direction: column;
}


@media (max-width: 900px) {
    section {
        align-items: start;
        padding: 1em;
        margin-top: 16vh;
        height: auto;
    }
    ul {
       display: flex;
       flex-direction: column;
       li {
            flex-direction: column-reverse;
            align-items: flex-start;
            gap: 0.5em;
       }
    }
    .details {
        flex-direction: row;
        gap: 1em;
        > span {
            margin-top: 0.15em;
        }
    }
    .cover {
        aspect-ratio: 16/9;
    }
}
</style>
