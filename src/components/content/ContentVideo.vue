<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { getFwdClones, getRevClones, registerPageLeave } from '@/transitions/projectTransition'
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'
import { coverImage } from '@/api/strapi'

const coverRef = ref<HTMLElement | null>(null)
const { activeProject } = storeToRefs(useProjectStore())

let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

onMounted(() => {
    const clone = getFwdClones()[0]

    if (!clone) {
        gsap.from(coverRef.value, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power3.out' })
    } else {
        if (!coverRef.value) return
        const dest = coverRef.value.getBoundingClientRect()
        gsap.set(coverRef.value, { opacity: 0 })
        gsap.to(clone, {
            x: dest.left - parseFloat(clone.style.left),
            y: dest.top - parseFloat(clone.style.top),
            width: dest.width,
            height: dest.height,
            duration: 0.9,
            ease: 'power3.inOut',
            onComplete: () => {
                clone.remove()
                gsap.set(coverRef.value!, { opacity: 1 })
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
        </div>
    </section>
</template>

<style scoped>
section {
    margin: 0 2em;
}
div {
    height: 80vh;
    background: black;
    overflow: hidden;
}

img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
</style>
