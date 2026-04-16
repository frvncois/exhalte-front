<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { gsap } from 'gsap'
import { useContactStore } from '@/stores/contact'
import { useLocaleStore } from '@/stores/locale'
import { registerPageLeave } from '@/transitions/projectTransition'

const ulRef = ref<HTMLElement | null>(null)
const circlesRef = ref<HTMLElement | null>(null)
const contactStore = useContactStore()
const { locale } = storeToRefs(useLocaleStore())
const shuffledTeam = ref<NonNullable<typeof contactStore.contact>['Team']>([])

function shuffleArray<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5)
}
let tl: gsap.core.Timeline | null = null
let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

async function animate() {
    await nextTick()

    const lis = ulRef.value?.querySelectorAll('li')
    if (!lis) return

    gsap.set(lis, { clipPath: 'inset(0 100% 0 0)' })
    gsap.to(lis, { clipPath: 'inset(0 0% 0 0)', duration: 0.75, ease: 'power3.out', stagger: 0.06, delay: 0.2 })

    const rowEls = circlesRef.value?.querySelectorAll('div')
    if (!rowEls) return

    const byRow = Array.from(rowEls).map(row => Array.from(row.querySelectorAll('span')))
    const byCol = [0, 1, 2, 3, 4].map(i => byRow.map(row => row[i]))
    const allSpans = circlesRef.value!.querySelectorAll('span')

    gsap.set(allSpans, { opacity: 0, backgroundColor: 'var(--light)' })

    const dx = window.innerWidth * 0.35
    const dy = window.innerHeight * 0.35

    tl = gsap.timeline({ delay: 1 })
    const variant = Math.floor(Math.random() * 6) + 1

    if (variant === 1) { // top → down
        gsap.set(allSpans, { y: -dy })
        byRow.forEach((rowSpans, i) => {
            tl!.to(rowSpans, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.04 }, i * 0.12)
        })
    } else if (variant === 2) { // bottom → up
        gsap.set(allSpans, { y: dy })
        const reversed = [...byRow].reverse()
        reversed.forEach((rowSpans, i) => {
            tl!.to(rowSpans, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.04 }, i * 0.12)
        })
    } else if (variant === 3) { // left → right
        gsap.set(allSpans, { x: -dx })
        byCol.forEach((colSpans, i) => {
            tl!.to(colSpans, { opacity: 1, x: 0, duration: 1, ease: 'power3.out', stagger: 0.04 }, i * 0.12)
        })
    } else if (variant === 4) { // right → left
        gsap.set(allSpans, { x: dx })
        const reversed = [...byCol].reverse()
        reversed.forEach((colSpans, i) => {
            tl!.to(colSpans, { opacity: 1, x: 0, duration: 1, ease: 'power3.out', stagger: 0.04 }, i * 0.12)
        })
    } else if (variant === 5) { // horizontal middle → expand top and bottom
        gsap.set(byRow[0] ?? [], { y: dy * 0.4 })
        gsap.set(byRow[1] ?? [], { y: dy * 0.2 })
        gsap.set(byRow[3] ?? [], { y: -dy * 0.2 })
        gsap.set(byRow[4] ?? [], { y: -dy * 0.4 })
        tl!.to(byRow[2] ?? [], { opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' })
        tl!.to([...(byRow[1] ?? []), ...(byRow[3] ?? [])], { opacity: 1, y: 0, duration: 0.9, stagger: 0.04, ease: 'power3.out' }, '-=0.3')
        tl!.to([...(byRow[0] ?? []), ...(byRow[4] ?? [])], { opacity: 1, y: 0, duration: 0.9, stagger: 0.04, ease: 'power3.out' }, '-=0.6')
    } else { // variant 6 — vertical middle → expand left and right
        const midSpans = byRow.map(row => row[2])
        const leftSpans = byRow.flatMap(row => [row[0], row[1]])
        const rightSpans = byRow.flatMap(row => [row[3], row[4]])
        gsap.set(leftSpans, { x: dx * 0.4 })
        gsap.set(rightSpans, { x: -dx * 0.4 })
        tl!.to(midSpans, { opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, '-=0.3')
        tl!.to(leftSpans, { opacity: 1, x: 0, duration: 1, stagger: 0.06, ease: 'power3.out' }, '-=0.3')
        tl!.to(rightSpans, { opacity: 1, x: 0, duration: 1, stagger: 0.06, ease: 'power3.out' }, '<')
    }

    tl.to(allSpans, { backgroundColor: 'transparent', duration: 1, ease: 'power2.out' }, '-=0.3')
}

onMounted(async () => {
    gsap.set(ulRef.value, { visibility: 'hidden' })
    gsap.set(circlesRef.value, { visibility: 'hidden' })
    await contactStore.fetchContact()
    shuffledTeam.value = shuffleArray(contactStore.contact?.Team ?? [])
    gsap.set(ulRef.value, { visibility: 'visible' })
    gsap.set(circlesRef.value, { visibility: 'visible' })
    animate()

    unregisterLeave = registerPageLeave((done) => {
        tl?.kill()
        const lis = ulRef.value?.querySelectorAll('li')
        const allSpans = circlesRef.value?.querySelectorAll('span')
        const tl2 = gsap.timeline({ onComplete: done })
        if (allSpans?.length) tl2.to(allSpans, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0)
        if (lis?.length) tl2.to(lis, { clipPath: 'inset(0 100% 0 0)', duration: 0.4, stagger: 0.04, ease: 'power2.in' }, 0)
        if (!allSpans?.length && !lis?.length) done()
    })
})
</script>

<template>
    <section>
        <ul ref="ulRef">
            <li>
                <h2>{{ locale === 'fr' ? 'Adresse' : 'Address' }}</h2>
                <a href="https://www.labellefacon.fr/" target="_blank" rel="noopener noreferrer">La Belle Façon ></a>
                <template v-for="line in (contactStore.contact?.Address ?? '').split('\n')" :key="line">
                    <p>{{ line }}</p>
                </template>
                <div>
                    <a target="_blank" rel="noopener noreferrer" :href="contactStore.contact?.Instagram ?? '#'">IN</a>
                    <a target="_blank" rel="noopener noreferrer" :href="contactStore.contact?.Linkedin ?? '#'">LKN</a>
                    </div>
            </li>
            <li v-for="member in shuffledTeam" :key="member.id">
                <h3>{{ member.Name }}</h3>
                <h4>{{ member.Title }}</h4>
                <a class="phone" :href="`tel:${member.Phone}`">{{ member.Phone }}</a>
                <a class="email" :href="`mailto:${member.Email}`">{{ member.Email }}</a>
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
    position: fixed;
    z-index: 1;
    inset: 0;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 6em);
    margin: 6em 2em -6em 2em;
}
ul {
    position: relative;
    z-index: 2;
    flex: 1;
}

li {
    position: absolute;
    display: flex;
    flex-direction: column;
    flex: 1;
     min-width: 25%;
}

h3, h4, .email, .phone {
    transition: transform 0.4s ease;
}

li:nth-child(1) { top: 4em; left: 0; 
div {
    display: flex;
    gap: 1em;
    margin-top: 0.5em;
}}

li:nth-child(2) {
    top: 4em; left: 25%;
    & .email { text-align: left; }
    & .phone  { text-align: right; }
    & h4      { text-align: center; }
    &:hover .email { transform: translateX(15%); }
    &:hover .phone { transform: translateX(-15%); }
    &:hover h4     { transform: translateX(5%); }
    &:hover h3     { transform: translate(10%);}
}
li:nth-child(3) {
    top: 28.5%; left: 50%;
    & .email { text-align: right; }
    & .phone  { text-align: right; }
    & h4      { text-align: center; }
    &:hover .email { transform: translateX(-12%); }
    &:hover .phone { transform: translateX(-8%); }
    &:hover h4     { transform: translateX(5%); }
    &:hover h3     { transform: translate(10%);}
}
li:nth-child(4) {
    top: 50.5%; left: 25%;
    & .email { text-align: left; }
    & .phone  { text-align: left; }
    & h4      { text-align: center; }
    &:hover .email { transform: translateX(10%); }
    &:hover .phone { transform: translateX(5%); }
    &:hover h4     { transform: translateX(-15%); }
    &:hover h3     { transform: translate(10%);}
}
li:nth-child(5) {
    top: 50.5%; left: 75%;
    & .email { text-align: right; }
    & .phone  { text-align: right; }
    & h4      { text-align: center; }
    &:hover .email { transform: translateX(-5%); }
    &:hover .phone { transform: translateX(-10%); }
    &:hover h4     { transform: translateX(-15%); }
    &:hover h3     { transform: translate(10%);}
}
li:nth-child(6) {
    top: 72.5%; left: 50%;
    & .email { text-align: right; }
    & .phone  { text-align: right; }
    & h4      { text-align: center; }
    &:hover .email { transform: translateX(-15%); }
    &:hover .phone { transform: translateX(-5%); }
    &:hover h4     { transform: translateX(15%); }
    &:hover h3     { transform: translate(10%);}
}

.circles {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    pointer-events: none;
    height: 102vh;
    div {
        flex: 1;
        display: flex;
        justify-content: space-between;
        span {
            height: 0.5em;
            width: 0.5em;
            border: 1px solid currentColor;
            border-radius: 10em;
        }
    }
}

h2, h3 {
    font-size: var(--text-sm);
    text-transform: uppercase;
    margin-bottom: 0.5em;
}

h4, p, a {
    font-family: var(--heading);
}

@media (max-width: 900px) {
    section {
        height: auto;
        margin: 8em 1em 0;
    }
    .circles {
        display: none;
    }
    ul {
        position: static;
        display: flex;
        flex-direction: column;
        gap: 1em;
        font-size: 0.75em;
    }
    li {
        position: static;
        padding-top: 0;
        text-align: left !important;
        flex: unset;
    }
    li * {
        text-align: left !important;
        transform: none !important;
    }
    li:hover * {
        transform: none !important;
    }
    h4 {
        max-width: unset;
    }
}
</style>