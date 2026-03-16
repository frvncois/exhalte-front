<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'

const ulRef = ref<HTMLElement | null>(null)
const circlesRef = ref<HTMLElement | null>(null)

onMounted(() => {
    const lis = ulRef.value?.querySelectorAll('li')
    if (!lis) return
    gsap.set(lis, { clipPath: 'inset(0 100% 0 0)' })

    const rows = circlesRef.value?.querySelectorAll('div')
    if (!rows) return

    const midSpans = Array.from(rows).map(row => row.querySelectorAll('span')[2])
    const leftSpans = Array.from(rows).flatMap(row => [row.querySelectorAll('span')[0], row.querySelectorAll('span')[1]])
    const rightSpans = Array.from(rows).flatMap(row => [row.querySelectorAll('span')[3], row.querySelectorAll('span')[4]])

    const allSpans = circlesRef.value!.querySelectorAll('span')
    gsap.set(allSpans, { opacity: 0, backgroundColor: 'var(--olive)' })
    gsap.set(leftSpans, { x: '30vw' })
    gsap.set(rightSpans, { x: '-30vw' })

    const tl = gsap.timeline({ delay: 1 })
    tl.to(midSpans, { opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, '-=0.3')
    tl.to(leftSpans, { opacity: 1, x: 0, duration: 1, stagger: 0.06, ease: 'power3.out' }, '-=0.3')
    tl.to(rightSpans, { opacity: 1, x: 0, duration: 1, stagger: 0.06, ease: 'power3.out' }, '<')
    tl.to(allSpans, { backgroundColor: 'transparent', duration: 1, ease: 'power2.out' }, '-=0.3')
    tl.to(lis, { clipPath: 'inset(0 0% 0 0)', duration: 0.75, ease: 'power3.out', stagger: 0.06 }, '-=0.5')
})
</script>

<template>
    <section>
        <ul ref="ulRef">
            <li>
                <h2>Address</h2>
                <p>66 rue de Rome</p>
                <p>75008 Paris</p>
            </li>
            <li>
                <h3>Louise Descorps-Declere</h3>
                <h4>Preoduction Assistant</h4>
                <p>+33 (0)6 43 57 16 74</p>
                <p>louise.declere@labellefacon.fr</p>
            </li>
            <li>
                <h3>Marielle Elis</h3>
                <h4>Founder & Producer</h4>
                <p>+33 (0)6 86 64 44 28</p>
                <p>marielle.elis@labellefacon.fr</p>
            </li>
            <li>
                <h3>Virginie Sagan</h3>
                <h4>Executive Producer</h4>
                <p>+33 (0)6 26 20 27 61</p>
                <p>virginie.sagan@labellefacon.fr</p>
            </li>
            <li>
                <h3>Yvan Rougon</h3>
                <h4>Development Manager</h4>
                <p>+33 (0)6 62 73 93 08</p>
                <p>yvan.rougon@labellefacon.fr</p>
            </li>
            <li>
                <h3>Jonathan Vienot</h3>
                <h4>Line Producer</h4>
                <p>+33 (0)6 86 94 09 72</p>
                <p>jonathan.vienot@labellefacon.fr</p>
            </li>
        </ul>
        <div class="circles" ref="circlesRef">
            <div><span></span><span></span><span></span><span></span><span></span></div>
            <div><span></span><span></span><span></span><span></span><span></span></div>
            <div><span></span><span></span><span></span><span></span><span></span></div>
            <div><span></span><span></span><span></span><span></span><span></span></div>
            <div><span></span><span></span><span></span><span></span><span></span></div>
        </div>
    </section>
</template>

<style scoped>
section {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    height: calc(100vh - 6em);
    margin: 6em 2em -6em 2em;
}
ul {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    position: relative;
    z-index: 2;
    flex: 1;
    padding-bottom: 14em;
}

li {
        padding-top: 4em;
    }

.circles {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    pointer-events: none;
    div {
        flex: 1;
        display: flex;
        justify-content: space-between;
        position: relative;
        span {
            height: 0.5em;
            width: 0.5em;
            border: 1px solid var(--olive);
            border-radius: 10em;
        }
    }
}

h2, h3 {
    font-size: var(--text-sm);
    text-transform: uppercase;
    margin-bottom: 0.5em;
}

h4, p {
    font-family: var(--heading);
}

li:nth-child(1) { grid-row: 1; grid-column: 1; }
li:nth-child(2) { grid-row: 1; grid-column: 2; }
li:nth-child(3) { grid-row: 2; grid-column: 3; }
li:nth-child(4) { grid-row: 3; grid-column: 2; }
li:nth-child(5) { grid-row: 3; grid-column: 4; }
li:nth-child(6) { grid-row: 4; grid-column: 3; }
</style>