<script setup lang="ts">
import { ref, watch, nextTick, computed, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const props = defineProps<{ items: { id?: number; url: string; formats?: { large?: { url: string } }; alternativeText?: string | null }[] }>()

type Mode = 'image' | 'video'
const mode = ref<Mode>('image')
const visible = ref(false)
const currentIndex = ref(0)

const overlayRef = ref<HTMLElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const closeRef = ref<HTMLElement | null>(null)
const counterRef = ref<HTMLElement | null>(null)
const prevRef = ref<HTMLElement | null>(null)
const nextRef = ref<HTMLElement | null>(null)
const controlsRef = ref<HTMLElement | null>(null)

const videoUrl = ref('')
const videoPaused = ref(true)
const videoDuration = ref(0)
const videoCurrentTime = ref(0)
const videoProgress = computed(() => videoDuration.value ? videoCurrentTime.value / videoDuration.value : 0)

function formatTime(s: number) {
    const m = Math.floor(s / 60)
    return `${String(m).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function onTimeUpdate() { videoCurrentTime.value = videoRef.value?.currentTime ?? 0 }
function onLoadedMetadata() { videoDuration.value = videoRef.value?.duration ?? 0 }
function onVideoEnded() { videoPaused.value = true }

function togglePlay() {
    if (!videoRef.value) return
    if (videoPaused.value) { videoRef.value.play(); videoPaused.value = false }
    else { videoRef.value.pause(); videoPaused.value = true }
}

function seek(e: MouseEvent) {
    if (!videoRef.value || !videoDuration.value) return
    const bar = e.currentTarget as HTMLElement
    const ratio = e.offsetX / bar.offsetWidth
    videoRef.value.currentTime = ratio * videoDuration.value
}

const mediaEl = computed(() => mode.value === 'video' ? videoRef.value : imgRef.value)
const uiEls = () => [closeRef.value, counterRef.value, prevRef.value, nextRef.value, controlsRef.value].filter(Boolean)

function animateOpen() {
    gsap.timeline()
        .fromTo(overlayRef.value,
            { clipPath: 'inset(100% 0 0% 0)' },
            { clipPath: 'inset(0% 0 0% 0)', duration: 1.6, ease: 'power4.inOut' })
        .fromTo(mediaEl.value,
            { clipPath: 'inset(0% 0 100% 0)' },
            { clipPath: 'inset(0% 0 0% 0)', duration: 1.4, ease: 'power3.out' }, '-=0.6')
        .fromTo(uiEls(),
            { opacity: 0 },
            { opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }, '-=0.4')
}

function close() {
    if (videoRef.value) { videoRef.value.pause(); videoPaused.value = true }
    gsap.timeline({ onComplete: () => { visible.value = false } })
        .to(uiEls(), { opacity: 0, duration: 0.4, stagger: 0.06 })
        .to(mediaEl.value, { clipPath: 'inset(0% 0 100% 0)', duration: 1, ease: 'power3.in' }, '-=0.1')
        .to(overlayRef.value, { clipPath: 'inset(100% 0 0% 0)', duration: 1.3, ease: 'power4.inOut' }, '-=0.3')
}

function open(index: number) {
    mode.value = 'image'
    currentIndex.value = index
    visible.value = true
}

function openVideo(url: string) {
    mode.value = 'video'
    videoUrl.value = url
    videoPaused.value = true
    videoCurrentTime.value = 0
    visible.value = true
}

let navigating = false
async function navigate(dir: 1 | -1) {
    if (navigating || mode.value === 'video') return
    navigating = true
    await gsap.to(imgRef.value, {
        clipPath: dir === 1 ? 'inset(100% 0 0% 0)' : 'inset(0% 0 100% 0)',
        duration: 0.9, ease: 'power3.in'
    })
    currentIndex.value = (currentIndex.value + dir + props.items.length) % props.items.length
    await nextTick()
    await gsap.fromTo(imgRef.value,
        { clipPath: dir === 1 ? 'inset(0% 0 100% 0)' : 'inset(100% 0 0% 0)' },
        { clipPath: 'inset(0% 0 0% 0)', duration: 1.2, ease: 'power3.out' }
    )
    navigating = false
}

function onKeydown(e: KeyboardEvent) {
    if (!visible.value) return
    if (e.key === 'Escape') close()
    if (mode.value === 'image') {
        if (e.key === 'ArrowLeft') navigate(-1)
        if (e.key === 'ArrowRight') navigate(1)
    }
    if (mode.value === 'video' && e.key === ' ') { e.preventDefault(); togglePlay() }
}

window.addEventListener('keydown', onKeydown)
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

watch(visible, async (v) => {
    if (v) {
        await nextTick()
        animateOpen()
        if (mode.value === 'video' && videoRef.value) {
            videoRef.value.src = videoUrl.value
            videoRef.value.play().then(() => { videoPaused.value = false }).catch(() => {})
        }
    }
})

defineExpose({ open, openVideo })
</script>

<template>
    <Teleport to="body">
        <div v-if="visible" ref="overlayRef" class="lightbox" @click.self="close">
            <span ref="counterRef" class="counter">
                <template v-if="mode === 'image'">
                    {{ String(currentIndex + 1).padStart(2, '0') }} / {{ String(items.length).padStart(2, '0') }}
                </template>
            </span>
            <button ref="closeRef" class="close" @click="close">( close )</button>

            <template v-if="mode === 'image'">
                <button ref="prevRef" class="nav prev" @click="navigate(-1)">←</button>
                <img
                    ref="imgRef"
                    :src="items[currentIndex]?.formats?.large?.url ?? items[currentIndex]?.url"
                    :alt="items[currentIndex]?.alternativeText ?? ''"
                />
                <button ref="nextRef" class="nav next" @click="navigate(1)">→</button>
            </template>

            <template v-else>
                <div ref="prevRef" />
                <div ref="nextRef" />
                <video
                    ref="videoRef"
                    :src="videoUrl"
                    playsinline
                    @timeupdate="onTimeUpdate"
                    @loadedmetadata="onLoadedMetadata"
                    @ended="onVideoEnded"
                    @click="togglePlay"
                />
                <div ref="controlsRef" class="controls">
                    <button class="play-pause" @click="togglePlay">
                        {{ videoPaused ? '▶' : '⏸' }}
                    </button>
                    <span class="time">{{ formatTime(videoCurrentTime) }}</span>
                    <div class="progress-bar" @click="seek">
                        <div class="progress-fill" :style="{ width: `${videoProgress * 100}%` }" />
                    </div>
                    <span class="time">{{ formatTime(videoDuration) }}</span>
                </div>
            </template>
        </div>
    </Teleport>
</template>

<style scoped>
.lightbox {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: var(--light);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--black);
}

img, video {
    max-width: 80vw;
    max-height: 75vh;
    object-fit: contain;
    display: block;
    cursor: pointer;
}

.close {
    position: absolute;
    top: 2em;
    right: 2em;
}

.counter {
    position: absolute;
    top: 2em;
    left: 2em;
    font-size: var(--text-sm);
    text-transform: uppercase;
}

.nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    padding: 1em;
}

.prev { left: 1em; }
.next { right: 1em; }

button {
    all: unset;
    cursor: pointer;
    color: var(--black);
    font-size: var(--text-sm);
    text-transform: uppercase;
}

.controls {
    position: absolute;
    bottom: 2em;
    left: 2em;
    right: 2em;
    display: flex;
    align-items: center;
    gap: 1em;
}

.play-pause {
    font-size: 1em;
}

.time {
    font-size: var(--text-sm);
    text-transform: uppercase;
    white-space: nowrap;
}

.progress-bar {
    flex: 1;
    height: 2px;
    background: rgba(0,0,0,0.2);
    cursor: pointer;
    position: relative;
}

.progress-fill {
    height: 100%;
    background: var(--black);
    pointer-events: none;
}
</style>
