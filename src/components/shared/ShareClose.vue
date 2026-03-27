<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { captureRevClones } from '@/transitions/projectTransition'

const router = useRouter()
const buttonRef = ref<HTMLElement | null>(null)

onMounted(() => {
    gsap.from(buttonRef.value, { opacity: 0, duration: 0.5, ease: 'power2.out' })
})

function handleRetour() {
    const playBtn = document.querySelector('[data-trans="cover"] .play-btn') as HTMLElement | null
    const coverImg = document.querySelector('[data-trans="cover"] img') as HTMLElement | null
    if (playBtn) gsap.set(playBtn, { opacity: 0 })
    if (coverImg) gsap.set(coverImg, { opacity: 1 })

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

    gsap.to(buttonRef.value, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => { router.push('/') },
    })
}
</script>

<template>
    <section>
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
