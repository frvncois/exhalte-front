<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { gsap } from 'gsap'
import { useRouter } from 'vue-router'
import { getFwdClones, getRevClones, registerPageLeave, consumeProjectToProject } from '@/transitions/projectTransition'
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'
import { slugify, coverImage } from '@/api/strapi'

const router = useRouter()
const { type, activeProject, projects } = storeToRefs(useProjectStore())
const projectStore = useProjectStore()

const spanRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const ulRef = ref<HTMLElement | null>(null)

let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

const activeIndex = computed(() =>
    projects.value.findIndex(p => p.documentId === activeProject.value?.documentId)
)

const otherProjects = computed(() =>
    projects.value
        .map((p, i) => ({ project: p, index: i + 1 }))
        .filter(({ project }) => project.documentId !== activeProject.value?.documentId)
)

function navigate(slug: string) {
    router.push(`/projects/${slug}`)
}

onMounted(() => {
    const clones = getFwdClones()

    unregisterLeave = registerPageLeave((done) => {
        if (getRevClones().length) { done(); return }
        const els = [spanRef.value, titleRef.value].filter(Boolean)
        const lis = ulRef.value ? Array.from(ulRef.value.querySelectorAll('li')) : []
        gsap.timeline({ onComplete: done }).to([...els, ...lis], { clipPath: 'inset(0 0 100% 0)', duration: 0.4, stagger: 0.04, ease: 'power2.in' })
    })

    if (!clones.length) {
        if (!consumeProjectToProject()) {
            const lis = ulRef.value ? Array.from(ulRef.value.querySelectorAll('li')) : []
            const els = [spanRef.value, titleRef.value, ...lis].filter(Boolean)
            gsap.from(els, {
                clipPath: 'inset(0 0 100% 0)',
                duration: 0.9,
                ease: 'power3.out',
                stagger: 0.1,
            })
        }
        return
    }

    function flyClone(clone: HTMLElement, el: HTMLElement, delay = 0, withScale = false) {
        const dest = el.getBoundingClientRect()
        gsap.set(el, { opacity: 0 })
        gsap.to(clone, {
            x: dest.left - parseFloat(clone.style.left),
            y: dest.top - parseFloat(clone.style.top),
            ...(withScale && {
                width: dest.width,
                height: dest.height,
            }),
            duration: 1.4,
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
        <div>
            <span ref="spanRef" data-trans="span">{{ String(activeIndex + 1).padStart(2, '0') }}</span>
        </div>
        <div class="details">
            <div class="title" ref="titleRef" data-trans="title">
                <h2>{{ activeProject?.Title }}</h2>
                <p v-if="activeProject?.Subtitle">{{ activeProject.Subtitle }}</p>
            </div>
            <ul ref="ulRef" data-trans="ul">
               <li
                    v-for="({ project, index }) in otherProjects"
                    :key="project.documentId"
                    @click="navigate(slugify(project.Title))"
               >
                    <div class="cover">
                        <img
                            v-if="coverImage(project)"
                            :src="coverImage(project)!.formats?.large?.url ?? coverImage(project)!.url"
                            :alt="project.Title"
                        />
                    </div>
                    <div class="info">
                        <span>{{ String(index).padStart(2, '0') }}</span>
                        <h3>{{ project.Title }}</h3>
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
@media (max-width: 768px) {
    section, section.is-gallery {
        position: static;
        flex-direction: column;
        gap: 2em;
    }
    .details {
        flex-direction: column;
        gap: 1em;
    }
    ul {
        flex-direction: column !important;
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
    overflow: hidden;
}

.cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
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
