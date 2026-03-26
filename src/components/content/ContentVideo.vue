<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { getFwdClones, getRevClones, registerPageLeave } from '@/transitions/projectTransition'
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'
import { coverImage } from '@/api/strapi'
import SharedLightbox from '@/components/shared/SharedLightbox.vue'

const coverRef = ref<HTMLElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)
const playBtnRef = ref<HTMLElement | null>(null)
const lightboxRef = ref<InstanceType<typeof SharedLightbox> | null>(null)
const { activeProject } = storeToRefs(useProjectStore())

let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

function play() {
    if (!activeProject.value?.Video) return
    lightboxRef.value?.openVideo(activeProject.value.Video)
}

function afterReveal() {
    if (activeProject.value?.Video) {
        gsap.from(playBtnRef.value, { opacity: 0, duration: 0.4, ease: 'power2.out' })
    }
    gsap.to(imgRef.value, { opacity: 0.75, duration: 0.5, ease: 'power2.out' })
}

onMounted(() => {
    const clone = getFwdClones()[0]

    if (!clone) {
        gsap.from(coverRef.value, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power3.out', onComplete: afterReveal })
    } else {
        if (!coverRef.value) return
        const dest = coverRef.value.getBoundingClientRect()
        gsap.set(coverRef.value, { opacity: 0 })
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
                afterReveal()
            },
        })
    }

    unregisterLeave = registerPageLeave((done) => {
        gsap.to(playBtnRef.value, { opacity: 0, duration: 0.2, ease: 'power2.in' })
        gsap.to(imgRef.value, { opacity: 1, duration: 0.2, ease: 'power2.in' })
        if (getRevClones().length) { done(); return }
        gsap.to(coverRef.value, { clipPath: 'inset(0 0 100% 0)', duration: 0.5, ease: 'power2.in', onComplete: done })
    })
})
</script>

<template>
    <section>
        <div class="cover" ref="coverRef" data-trans="cover">
            <img
                ref="imgRef"
                v-if="activeProject && coverImage(activeProject)"
                :src="coverImage(activeProject)!.formats?.large?.url ?? coverImage(activeProject)!.url"
                :alt="activeProject.Title"
            />
            <button
                v-if="activeProject?.Video"
                ref="playBtnRef"
                class="play-btn"
                @click="play"
            >
                <span>▶</span>
                <span class="label">Play</span>
            </button>
        </div>
    </section>
    <SharedLightbox ref="lightboxRef" :items="[]" />
</template>

<style scoped>
section {
    margin: 0 2em;
    height: 100%;
}
.cover {
    background: var(--black);
    overflow: hidden;
    position: relative;
    height: 100%;
}
@media (max-width: 768px) {
    section { margin: 0; }
    .cover { height: 56vw; }
}

img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.play-btn {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25em;
    background: none;
    border: none;
    cursor: pointer;
    color: white;
    transition: transform 0.2s ease;
}

.play-btn span:first-child {
    font-size: 3em;
    line-height: 1;
}

.label {
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.play-btn:hover {
    transform: scale(1.05);
}
</style>
