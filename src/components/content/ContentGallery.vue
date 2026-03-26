<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { getFwdClones } from '@/transitions/projectTransition'
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'

const { activeProject } = storeToRefs(useProjectStore())

const coverRef = ref<HTMLElement | null>(null)
const extrasRef = ref<HTMLElement[]>([])

onMounted(() => {
    gsap.from(extrasRef.value, {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.1,
        delay: 0.5,
    })

    const clone = getFwdClones()[0]

    if (!clone) {
        gsap.from(coverRef.value, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power3.out' })
        return
    }

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
        },
    })
})
</script>

<template>
    <section>
        <div class="cover" ref="coverRef" data-trans="cover">
            <img v-if="activeProject?.Gallery?.[0]" :src="activeProject.Gallery[0].formats?.large?.url ?? activeProject.Gallery[0].url" :alt="activeProject.Gallery[0].alternativeText ?? ''" />
        </div>
        <div
            v-for="(item, i) in (activeProject?.Gallery?.slice(1) ?? [])"
            :key="item.id ?? i"
            class="cover"
            :ref="el => extrasRef[i] = el as HTMLElement"
        >
            <img :src="item.formats?.large?.url ?? item.url" :alt="item.alternativeText ?? ''" />
        </div>
    </section>
</template>

<style scoped>
section {
    margin: 0 2em;
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 1em;
}

.cover {
    height: 80vh;
    background: black;
    overflow: hidden;
}

.cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
@media (max-width: 768px) {
    section { margin: 0; flex: none; }
    .cover { height: 56vw; }
}
</style>
