<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap } from 'gsap'
import { getFwdClones, getRevClones, registerPageLeave } from '@/transitions/projectTransition'
import lenis from '@/lib/lenis'

const hasFwdClone = !!getFwdClones()[0]
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'
import { coverImage } from '@/api/strapi'
import SharedLightbox from '@/components/shared/SharedLightbox.vue'

const coverRef = ref<HTMLElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)
const playBtnRef = ref<HTMLElement | null>(null)
const inlineVideoRef = ref<HTMLVideoElement | null>(null)
const controlsRef = ref<HTMLElement | null>(null)
const lightboxRef = ref<InstanceType<typeof SharedLightbox> | null>(null)
const { activeProject } = storeToRefs(useProjectStore())

let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

const isPlaying = ref(false)
const inlineVideoSrc = ref<string | undefined>(undefined)
const videoPaused = ref(true)
const videoDuration = ref(0)
const videoCurrentTime = ref(0)
const videoProgress = computed(() => videoDuration.value ? videoCurrentTime.value / videoDuration.value : 0)

function formatTime(s: number) {
    const m = Math.floor(s / 60)
    return `${String(m).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function onTimeUpdate() { videoCurrentTime.value = inlineVideoRef.value?.currentTime ?? 0 }
function onLoadedMetadata() { videoDuration.value = inlineVideoRef.value?.duration ?? 0 }
function onVideoEnded() { videoPaused.value = true }

function togglePlay() {
    if (!inlineVideoRef.value) return
    if (videoPaused.value) { inlineVideoRef.value.play(); videoPaused.value = false }
    else { inlineVideoRef.value.pause(); videoPaused.value = true }
}

function seek(e: MouseEvent) {
    if (!inlineVideoRef.value || !videoDuration.value) return
    const bar = e.currentTarget as HTMLElement
    const ratio = e.offsetX / bar.offsetWidth
    inlineVideoRef.value.currentTime = ratio * videoDuration.value
}

async function startPlay() {
    inlineVideoSrc.value = activeProject.value?.Video ?? undefined
    isPlaying.value = true
    await nextTick()
    inlineVideoRef.value?.play()
    videoPaused.value = false
    gsap.set(controlsRef.value, { opacity: 0 })
    gsap.to(controlsRef.value, { opacity: 1, duration: 0.3, ease: 'power2.out' })
}

function openInLightbox() {
    if (inlineVideoRef.value) { inlineVideoRef.value.pause(); videoPaused.value = true }
    if (activeProject.value?.Video) lightboxRef.value?.openVideo(activeProject.value.Video)
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
                lenis.start()
            },
        })
    }

    unregisterLeave = registerPageLeave((done) => {
        if (inlineVideoRef.value) { inlineVideoRef.value.pause(); videoPaused.value = true }

        const tl = gsap.timeline()

        if (isPlaying.value) {
            tl.to([inlineVideoRef.value, controlsRef.value], { opacity: 0, duration: 0.25, ease: 'power2.in' })
            tl.to(imgRef.value, { opacity: 0.75, duration: 0.25, ease: 'power2.out' }, '<')
        } else {
            tl.to(playBtnRef.value, { opacity: 0, duration: 0.2, ease: 'power2.in' })
            tl.to(imgRef.value, { opacity: 1, duration: 0.2, ease: 'power2.in' }, '<')
        }

        if (getRevClones().length) { tl.call(done); return }
        tl.to(coverRef.value, { clipPath: 'inset(0 0 100% 0)', duration: 0.5, ease: 'power2.in', onComplete: done })
    })
})
</script>

<template>
    <section>
        <div class="cover" ref="coverRef" :style="hasFwdClone ? { opacity: 0 } : {}" data-trans="cover">
            <img
                ref="imgRef"
                v-if="activeProject && coverImage(activeProject)"
                :src="coverImage(activeProject)!.formats?.large?.url ?? coverImage(activeProject)!.url"
                :alt="activeProject.Title"
                :class="{ faded: isPlaying }"
            />
            <video
                v-show="isPlaying"
                ref="inlineVideoRef"
                :src="inlineVideoSrc"
                playsinline
                @timeupdate="onTimeUpdate"
                @loadedmetadata="onLoadedMetadata"
                @ended="onVideoEnded"
                @click="togglePlay"
            />
            <button
                v-show="activeProject?.Video && !isPlaying"
                ref="playBtnRef"
                class="play-btn"
                @click="startPlay"
            >
                <span>▶</span>
                <span class="label">Play</span>
            </button>
            <div v-show="isPlaying" ref="controlsRef" class="controls">
                <button class="play-pause" @click="togglePlay">{{ videoPaused ? '▶' : '⏸' }}</button>
                <span class="time">{{ formatTime(videoCurrentTime) }}</span>
                <div class="progress-bar" @click.stop="seek">
                    <div class="progress-fill" :style="{ width: `${videoProgress * 100}%` }" />
                </div>
                <span class="time">{{ formatTime(videoDuration) }}</span>
                <button class="expand" @click.stop="openInLightbox">[ ↗ ]</button>
            </div>
        </div>
    </section>
    <SharedLightbox ref="lightboxRef" :items="[]" />
</template>

<style scoped>
section {
    margin: 6em 2em 0;
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

img, video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

img.faded {
    opacity: 0 !important;
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

.controls {
    position: absolute;
    bottom: 2em;
    left: 2em;
    right: 2em;
    display: flex;
    align-items: center;
    gap: 1em;
    color: white;
    z-index: 2;
}

button {
    all: unset;
    cursor: pointer;
    font-size: var(--text-sm);
    text-transform: uppercase;
}

.time {
    font-size: var(--text-sm);
    text-transform: uppercase;
    white-space: nowrap;
}

.progress-bar {
    flex: 1;
    height: 2px;
    background: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    position: relative;
}

.progress-fill {
    height: 100%;
    background: white;
    pointer-events: none;
}
</style>
