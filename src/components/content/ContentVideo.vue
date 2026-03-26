<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { getFwdClones, getRevClones, registerPageLeave } from '@/transitions/projectTransition'
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'
import { coverImage } from '@/api/strapi'

const coverRef = ref<HTMLElement | null>(null)
const playBtnRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const playing = ref(false)
const { activeProject } = storeToRefs(useProjectStore())

let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

function play() {
    if (!activeProject.value?.Video || !videoRef.value) return
    playing.value = true
    videoRef.value.src = activeProject.value.Video
    gsap.to(playBtnRef.value, { opacity: 0, duration: 0.3, ease: 'power2.in' })
    gsap.to(videoRef.value, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.2 })
    videoRef.value.play()
}

onMounted(() => {
    const clone = getFwdClones()[0]

    if (!clone) {
        gsap.from(coverRef.value, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power3.out', onComplete: () => {
            if (activeProject.value?.Video) gsap.from(playBtnRef.value, { opacity: 0, duration: 0.4, ease: 'power2.out' })
        }})
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
                if (activeProject.value?.Video) gsap.from(playBtnRef.value, { opacity: 0, duration: 0.4, ease: 'power2.out' })
            },
        })
    }

    unregisterLeave = registerPageLeave((done) => {
        if (getRevClones().length) { done(); return }
        gsap.to(coverRef.value, { clipPath: 'inset(0 0 100% 0)', duration: 0.5, ease: 'power2.in', onComplete: done })
    })
})
</script>

<template>
    <section>
        <div class="cover" ref="coverRef" data-trans="cover">
            <img
                v-if="activeProject && coverImage(activeProject)"
                :src="coverImage(activeProject)!.formats?.large?.url ?? coverImage(activeProject)!.url"
                :alt="activeProject.Title"
            />
            <video
                v-if="activeProject?.Video"
                ref="videoRef"
                playsinline
                controls
            />
            <button
                v-if="activeProject?.Video && !playing"
                ref="playBtnRef"
                class="play-btn"
                @click="play"
            >
                ▶
            </button>
        </div>
    </section>
</template>

<style scoped>
section {
    margin: 0 2em;
}
.cover {
    height: 80vh;
    background: black;
    overflow: hidden;
    position: relative;
}
@media (max-width: 768px) {
    section { margin: 0; }
    .cover { height: 56vw; }
}

img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

video {
    position: absolute;
    inset: 0;
    opacity: 0;
}

.play-btn {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 4em;
    color: white;
    transition: transform 0.2s ease;
}

.play-btn:hover {
    transform: scale(1.1);
}
</style>
