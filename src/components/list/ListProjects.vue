<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount, computed } from 'vue'
import { gsap } from 'gsap'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'
import { slugify, coverImage } from '@/api/strapi'
import { registerPageLeave } from '@/transitions/projectTransition'

const router = useRouter()
const projectStore = useProjectStore()
const { activeProject, projects } = storeToRefs(projectStore)

const otherProjects = computed(() =>
    projects.value
        .map((p, i) => ({ project: p, index: i + 1 }))
        .filter(({ project }) => project.documentId !== activeProject.value?.documentId)
)

function navigate(slug: string) {
    router.push(`/projects/${slug}`)
}

const sectionRef = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

onMounted(() => {
    const lis = track.value?.querySelectorAll('li')
    if (!lis) return

    lis.forEach(li => {
        gsap.set(li.querySelector('.cover'), { clipPath: 'inset(0 0 100% 0)' })
        gsap.set(li.querySelector('.details'), { opacity: 0 })
    })

    observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return
        lis.forEach((li, i) => {
            const delay = i * 0.12
            gsap.to(li.querySelector('.cover'), { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power3.out', delay })
            gsap.to(li.querySelector('.details'), { opacity: 1, duration: 0.8, ease: 'power2.out', delay: delay + 0.3 })
        })
        observer?.disconnect()
    }, { threshold: 0.1 })

    observer.observe(sectionRef.value!)

    unregisterLeave = registerPageLeave((done) => {
        const covers = track.value?.querySelectorAll('.cover')
        if (!covers?.length) { done(); return }
        gsap.timeline({ onComplete: done }).to(covers, { clipPath: 'inset(0 100% 0 0)', duration: 0.4, stagger: 0.05, ease: 'power2.in' })
    })
})

onUnmounted(() => observer?.disconnect())

let isDragging = false
let startX = 0
let scrollLeft = 0
let dragDistance = 0

function onMouseDown(e: MouseEvent) {
    isDragging = true
    dragDistance = 0
    startX = e.pageX - track.value!.offsetLeft
    scrollLeft = track.value!.scrollLeft
    track.value!.style.cursor = 'grabbing'
}

function onMouseMove(e: MouseEvent) {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - track.value!.offsetLeft
    const delta = x - startX
    dragDistance = Math.abs(delta)
    track.value!.scrollLeft = scrollLeft - delta
}

function onMouseUp() {
    isDragging = false
    track.value!.style.cursor = 'grab'
}

function onClick(e: MouseEvent) {
    if (dragDistance > 5) e.stopPropagation()
}
</script>

<template>
    <section ref="sectionRef">
        <ul
            ref="track"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
            @click.capture="onClick"
        >
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
                <div class="details">
                    <span>{{ String(index).padStart(2, '0') }}</span>
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
    overflow: hidden;
    width: 100vw;
    padding: 2em;
}

ul {
    display: flex;
    gap: 1.5em;
    list-style: none;
    margin: 0;
    --visible: 3.25;
    --gap: 1.5rem;
    overflow-x: scroll;
    scrollbar-width: none;
    cursor: grab;
    user-select: none;
}

ul::-webkit-scrollbar {
    display: none;
}

li {
    flex: 0 0 calc((100% - (var(--visible) - 1) * var(--gap)) / var(--visible));
    display: flex;
    gap: 0.75rem;
    cursor: pointer;
}

.cover {
    background-color: black;
    aspect-ratio: 4 / 3;
    width: 100%;
    flex: 1;
    overflow: hidden;
}

.cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.details {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.25rem;
    flex: 1;
}

@media (max-width: 768px) {
    ul {
        --visible: 1.25;
    }
}
</style>
