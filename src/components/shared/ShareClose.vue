<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { captureRevClones } from '@/transitions/projectTransition'
import lenis from '@/lib/lenis'

const router = useRouter()
const sectionRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)

onMounted(() => {
    gsap.from(sectionRef.value, { y: '-100%', duration: 0.8, ease: 'power3.out' })
    gsap.from(buttonRef.value, { opacity: 0, duration: 0.4, ease: 'power2.out', delay: 0.35 })
})

function handleRetour() {
    lenis.stop()
    const playBtn = document.querySelector('[data-trans="cover"] .play-btn') as HTMLElement | null
    const coverEl = document.querySelector('[data-trans="cover"]') as HTMLElement | null
    const coverImg = coverEl?.querySelector('img') as HTMLImageElement | null
    const coverVideo = coverEl?.querySelector('video') as HTMLVideoElement | null
    if (playBtn) gsap.set(playBtn, { opacity: 0 })
    if (coverImg) gsap.set(coverImg, { opacity: 1 })

    // Force the cover media to fill its container before cloning, so the reverse
    // transition clone scales cleanly (same as the grid item's fill behaviour).
    // The original is immediately hidden behind the clone, so no visual change is seen.
    if (coverEl) {
        const media = coverImg ?? coverVideo
        if (media) {
            const h = coverEl.getBoundingClientRect().height
            coverEl.style.height = `${h}px`
            Object.assign(media.style, { width: '100%', height: '100%', objectFit: 'cover' })
        }
    }

    const cover = document.querySelector('[data-trans="cover"]')
    const span = document.querySelector('[data-trans="span"]')
    const title = document.querySelector('[data-trans="title"]')
    const ul = document.querySelector('[data-trans="ul"]')
    const ulLis = ul ? Array.from(ul.querySelectorAll('li')) : []
    const ulElements = ulLis.flatMap(li => [
        li.querySelector('.cover')!,
        li.querySelector('.info')!,
    ])

    if (cover && span && title) {
        captureRevClones([cover, span, title, ...ulElements])
    }

    gsap.to(buttonRef.value, { opacity: 0, duration: 0.2, ease: 'power2.in' })
    gsap.to(sectionRef.value, {
        y: '-100%',
        duration: 0.5,
        ease: 'power3.in',
        onComplete: () => { router.push('/') },
    })
}
</script>

<template>
    <section ref="sectionRef">
        <button ref="buttonRef" @click="handleRetour">[x] retour</button>
    </section>
</template>

<style scoped>
section {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 12;
    height: 6em;
    text-align: center;
    text-transform: uppercase;
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
}
button {
    background: none;
    border: none;
    cursor: pointer;
    font: inherit;
    text-transform: uppercase;
    padding: 0;
}
</style>
