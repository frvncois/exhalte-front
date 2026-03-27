<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import { getFwdClones, registerPageLeave } from '@/transitions/projectTransition'
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'

const { activeProject } = storeToRefs(useProjectStore())

const sectionRef = ref<HTMLElement | null>(null)
const coverRef = ref<HTMLElement | null>(null)
const extrasRef = ref<HTMLElement[]>([])
const observers: { disconnect: () => void }[] = []
let unregisterLeave: (() => void) | null = null

onBeforeUnmount(() => {
    unregisterLeave?.()
    observers.forEach(obs => obs.disconnect())
})

let coverDone = false
const pendingAnimations: (() => void)[] = []

function onCoverDone() {
    coverDone = true
    pendingAnimations.forEach(fn => fn())
    pendingAnimations.length = 0
}

// waitForCover: hide immediately, but hold the reveal until onCoverDone fires
function observeCover(cover: HTMLElement, duration = 2, onComplete?: () => void, waitForCover = false) {
    gsap.set(cover, { clipPath: 'inset(0 0 100% 0)' })
    const obs = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return
        obs.disconnect()
        const animate = () => gsap.to(cover, { clipPath: 'inset(0 0 0% 0)', duration, ease: 'power3.out', onComplete })
        if (!waitForCover || coverDone) {
            animate()
        } else {
            pendingAnimations.push(animate)
        }
    }, { threshold: 0.75 })
    obs.observe(cover)
    observers.push(obs)
}

// Observe extras as soon as data is available — hides them before any paint,
// but holds the reveal until the cover animation completes
let extrasObserved = false
watch(activeProject, async (val) => {
    if (!val || extrasObserved) return
    extrasObserved = true
    await nextTick()
    extrasRef.value.forEach(cover => observeCover(cover, 2, undefined, true))
}, { immediate: true })

onMounted(() => {
    unregisterLeave = registerPageLeave((done) => {
        const covers = sectionRef.value?.querySelectorAll('.cover')
        if (!covers?.length) { done(); return }
        gsap.timeline({ onComplete: done })
            .to(covers, { clipPath: 'inset(100% 0 0% 0)', duration: 0.4, stagger: 0.04, ease: 'power2.in' })
    })

    const clone = getFwdClones()[0]

    if (!clone) {
        if (coverRef.value) observeCover(coverRef.value, 1.2, onCoverDone, false)
        return
    }

    if (!coverRef.value) return

    gsap.set(coverRef.value, { opacity: 0 })

    const runAnimation = () => {
        if (!coverRef.value) return
        const dest = coverRef.value.getBoundingClientRect()
        gsap.to(clone, {
            x: dest.left - parseFloat(clone.style.left),
            y: dest.top - parseFloat(clone.style.top),
            width: dest.width,
            height: dest.height,
            duration: 1.4,
            ease: 'power3.inOut',
            onComplete: () => {
                clone.remove()
                gsap.set(coverRef.value!, { opacity: 1 })
                onCoverDone()
            },
        })
    }

    const img = coverRef.value.querySelector('img') as HTMLImageElement | null
    if (img && !img.complete) {
        img.addEventListener('load', runAnimation, { once: true })
        img.addEventListener('error', runAnimation, { once: true })
    } else {
        requestAnimationFrame(runAnimation)
    }
})
</script>

<template>
    <section ref="sectionRef">
        <div class="cover" ref="coverRef" data-trans="cover">
            <template v-if="activeProject?.Cover">
                <video
                    v-if="activeProject.Cover.mime?.startsWith('video/')"
                    :src="activeProject.Cover.url"
                    autoplay loop muted playsinline
                />
                <img
                    v-else
                    :src="activeProject.Cover.formats?.large?.url ?? activeProject.Cover.url"
                    :alt="activeProject.Cover.alternativeText ?? ''"
                />
            </template>
        </div>
        <div
            v-for="(item, i) in (activeProject?.Slideshow ?? [])"
            :key="item.id ?? i"
            class="cover"
            :ref="el => extrasRef[i] = el as HTMLElement"
        >
            <video
                v-if="item.mime?.startsWith('video/')"
                :src="item.url"
                autoplay loop muted playsinline
            />
            <img v-else :src="item.formats?.large?.url ?? item.url" :alt="item.alternativeText ?? ''" />
        </div>
    </section>
</template>

<style scoped>
section {
    margin: 6.25em 2em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4em;
}

.cover {
    max-width: 80%;
    background: black;
    overflow: hidden;
}

.cover img,
.cover video {
    max-width: 100%;
    height: auto;
    object-fit: cover;
    display: block;
}
@media (max-width: 768px) {
    section { margin: 0; flex: none; }
    .cover { height: 56vw; }
}
</style>
