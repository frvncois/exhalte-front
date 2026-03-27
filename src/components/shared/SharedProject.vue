<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import { useRouter } from 'vue-router'
import { getFwdClones, getRevClones, registerPageLeave, consumeProjectToProject } from '@/transitions/projectTransition'
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'
import { slugify, coverImage } from '@/api/strapi'

const router = useRouter()
const { type, activeProject, projects } = storeToRefs(useProjectStore())

const spanRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const ulRef = ref<HTMLElement | null>(null)

let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

// Project-to-project navigation: skip initial load (oldVal is null), animate on change
watch(activeProject, async (newVal, oldVal) => {
    if (!newVal || !oldVal) return
    await nextTick()

    const lis = ulRef.value ? Array.from(ulRef.value.querySelectorAll('li')) : []
    const covers = lis.map(li => li.querySelector('.cover')).filter(Boolean) as HTMLElement[]
    const infos = lis.map(li => li.querySelector('.info')).filter(Boolean) as HTMLElement[]
    const textEls = [spanRef.value, titleRef.value, ...infos].filter(Boolean) as HTMLElement[]

    // Clear clip-path left on li elements by the leave animation
    gsap.set(lis, { clipPath: 'none' })
    gsap.set([spanRef.value, titleRef.value], { clipPath: 'none' })

    gsap.from(covers, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power3.out', stagger: 0.08 })
    gsap.from(textEls, { opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.05 })
})

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

    if (ulRef.value?.closest('section.is-gallery')) {
        const galleryLis = Array.from(ulRef.value.querySelectorAll('li')) as HTMLElement[]
        galleryLis.forEach(li => {
            const h3 = li.querySelector('h3') as HTMLElement | null
            const w = h3 ? h3.offsetWidth : 0
            li.style.setProperty('--h3-w', `-${w}px`)
        })
    } else if (ulRef.value) {
        const nonGalleryLis = Array.from(ulRef.value.querySelectorAll('li')) as HTMLElement[]
        nonGalleryLis.forEach(li => {
            const h3 = li.querySelector('h3') as HTMLElement | null
            const info = li.querySelector('.info') as HTMLElement | null
            if (h3 && info) {
                info.style.setProperty('--info-base-w', `${info.offsetWidth}px`)
                info.style.setProperty('--h3-info-w', `${h3.offsetWidth}px`)
            }
        })
    }

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
    if (clones[2] && titleRef.value) flyClone(clones[2], titleRef.value, 0.04, true)

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
        <div class="details">
            <div class="left">
                <span ref="spanRef" data-trans="span">{{ String(activeIndex + 1).padStart(2, '0') }}</span>
                <div class="title" ref="titleRef" data-trans="title">
                    <h2>{{ activeProject?.Title }}</h2>
                    <p v-if="activeProject?.Subtitle">{{ activeProject.Subtitle }}</p>
                </div>
            </div>
            <div v-if="type === 'gallery'" class="slot">
                <slot />
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
                        <div :class="['info', { 'info--expandable': type !== 'gallery' }]">
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
    display: flex;
    flex-direction: row;
    padding: 0em 2em;
    flex: 1;
    .details {
        display: flex;
        flex-direction: row;
        align-items: start;
        inset: 0;
        flex: 1;
        & ul {
            position: sticky;
            top: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            flex: unset;
            flex-direction: column;
            li {
                position: relative;
                width: 30em;
                margin-left: -20em;
                right: -20em;
            }
             h3 {
                position: absolute;
                bottom: 0;
            }
        }
        .left {
            position: sticky;
            top: 0;
            height: 100vh;
            display: flex;
            flex: unset;
            flex-direction: column;
            display: flex;
            justify-content: center;
            > .title {
                flex: unset;
            }
        }
        .slot {
            flex: 1;
            min-width: 0;
        }
    }
}

.details {
    display: flex;
}

.title {
    flex: 1 1 50%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

ul {
    flex: 1 0 50%;
    display: flex;
    justify-content: end;
    gap: 1em;
}

li {
    flex: 0 0 auto;
    display: flex;
    gap: 0.75em;
    cursor: pointer;
}

h2 {
    font-size: var(--text-regular);
    white-space: nowrap;
}

h3 {
    font-size: var(--text-regular);
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.4s ease;
}

section.is-gallery li {
    transition: transform 0.4s ease;
}

section.is-gallery li:hover {
    transform: translateX(var(--h3-w, 0px));
}

li:hover h3 {
    opacity: 1;
}

p {
    font-size: var(--text-sm);
    text-transform: uppercase;
}

.cover {
    background-color: black;
    aspect-ratio: 4/3;
    height: 6em;
    flex: 0 0 auto;
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

    &.info--expandable {
        width: var(--info-base-w, max-content);
        overflow: hidden;
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    li:hover &.info--expandable {
        width: var(--h3-info-w, max-content);
    }
    & h3 {
        position: absolute;
        bottom: 0;
    }
}




@media (max-width: 900px) {
    section, section.is-gallery {
        position: static;
        flex-direction: column;
        gap: 2em;
        padding: 8em 1em 2em;
    }
    .details {
        flex-direction: column-reverse;
        gap: 6em;
    }
    .left {
        display: flex;
        flex-direction: row;
        gap: 1em;
    }
    ul {
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        flex-wrap: nowrap;
        justify-content: start;
        scrollbar-width: none;
        padding-bottom: 0.5em;
        &::-webkit-scrollbar { display: none; }
    }
    li {
        scroll-snap-align: start;
        flex: 0 0 auto;
        &:hover h3 { opacity: 0; }
        &:hover { transform: none; }
        &:hover .info--expandable { width: var(--info-base-w, max-content); }
    }
}
</style>
