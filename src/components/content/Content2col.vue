<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const sectionRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
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
                <li><h3>direction creative</h3></li>
                <li><h3>production</h3></li>
                <li><h3>conception artistique</h3></li>
                <li><h3>curation</h3></li>
                <li><h3>film de marque</h3></li>
                <li><h3>films d'art</h3></li>
                <li><h3>films documentaires</h3></li>
                <li><h3>clips musicaux</h3></li>
                <li><h3>long metrage</h3></li>
                <li><h3>campagnes visuelles</h3></li>
                <li><h3>séries télé</h3></li>
                <li><h3>prestation événementielles</h3></li>
            </ul>
        </div>
        <div>
            <h2>(Who we are)</h2>
            <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
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