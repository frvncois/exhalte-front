<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { getService, type Service } from '@/api/strapi'

const sectionRef = ref<HTMLElement | null>(null)
const service = ref<Service | null>(null)
let observer: IntersectionObserver | null = null

onMounted(async () => {
    try {
        service.value = await getService()
    } catch (e) {
        console.warn('Service fetch failed:', e)
    }

    gsap.set(sectionRef.value, { opacity: 0, x: 40 })
    observer = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) {
            gsap.to(sectionRef.value, { opacity: 1, x: 0, duration: 1, ease: 'power2.out' })
            observer?.disconnect()
        }
    }, { threshold: 0.2 })
    observer.observe(sectionRef.value!)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
    <section ref="sectionRef">
        <div>
            <h2>(Services)</h2>
            <ul>
                <li v-for="item in service?.Services" :key="item.id">
                    <h3>{{ item.Title }}</h3>
                </li>
            </ul>
        </div>
        <div>
            <h2>(Who we are)</h2>
            <p
                v-for="(block, i) in service?.Intro"
                :key="i"
            >{{ block.children.map((c: { text: string }) => c.text).join('') }}</p>
        </div>
    </section>
</template>

<style scoped>
section {
    padding: 2em;
    display: flex;
    div:first-child {
        flex: 1;
    }
    div:last-child {
        flex: 2;
    }
}
h2 {
    font-family: 'body';
    text-transform: uppercase;
    font-size: 1em;
    margin-bottom: 2em;
}
h3 {
    font-family: 'heading';
}
p {
    font-size: 1.5em;
}
</style>
