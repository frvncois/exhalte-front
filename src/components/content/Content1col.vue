<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const sectionRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
    gsap.set(sectionRef.value, { opacity: 0 })
    observer = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) {
            gsap.to(sectionRef.value, { opacity: 1, duration: 1.2, ease: 'power2.out' })
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
            <p>
                Dancer and model Mès Lesne manifests Gen Z’s rallying cry for liberty in his first choreographed film, Cor, which is set in the volcanic badlands of Lanzarote. Lesne hand picked dancers that he knew could express the wild and dogged pursuit of freedom his generation is striving for; to follow paths unknown and arrive in a new world, free of suffocating binaries and damaging archetypes.
            </p>
            <p>
                The choreography hinges on what Lesne describes as “the unhooked jump,” a broken and disarticulated rise upwards, propelled by the energy of the spirit. The harsh, volcanic Spanish island was the perfect landscape to have his tribe of wild dancers tear across; with steely glances set on the horizon, they cover themselves in the dark earth. Each person’s unruly and pulsating movements are separate from the others, but the tribal blue markings—unique to each dancer— that adorn their bodies signify that they belong to a whole. This is why it would be of no surprise to learn that Lesne was inspired by the rough, writhing action of rugby when he first envisioned this project.
                “I watched men fighting for a ball in the pouring rain, their bodies wrestling and smeared with dirt,” says the choreographer. “Without the slightest fear of the other, they were going to make contact. I immediately imagined an organic choreography inspired by almost tribal movements. I wanted to create a pack, to reinterpret this breath and the surpassing of oneself.”
            </p>
            <p>
                Bringing this vision to life was director duo SimonaGun, whose energetic camera angles and brutal close-ups give this dance film the intense drama and competitive climax Lesne was looking for. All in all, Cor is a bugle call for action manifest in boundary-breaking impetuous dance.  
            </p>
        </div>
    </section>
</template>

<style scoped>
section {
    padding: 2em;
    display: grid;
    grid-template-columns: 1fr 1fr;
}

div {
    display: flex;
    flex-direction: column;
    gap: 2em;
}

p {
    font-size: var(--text-regular);
}
</style>