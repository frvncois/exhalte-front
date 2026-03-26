<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap } from 'gsap'
import { useContactStore } from '@/stores/contact'
import { registerPageLeave } from '@/transitions/projectTransition'

const ulRef = ref<HTMLElement | null>(null)
const circlesRef = ref<HTMLElement | null>(null)
const contactStore = useContactStore()
let tl: gsap.core.Timeline | null = null
let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

async function animate() {
    await nextTick()

    const lis = ulRef.value?.querySelectorAll('li')
    if (!lis) return

    lis.forEach((li, liIndex) => {
        const targets = Array.from(li.querySelectorAll<HTMLElement>('h3, h4'))
        const origX = targets.map(el => {
            const t = window.getComputedStyle(el).transform
            return t === 'none' ? 0 : new DOMMatrixReadOnly(t).m41
        })

        li.addEventListener('mouseenter', () => {
            targets.forEach((el, i) => {
                const hoverX = (liIndex === 1 || liIndex === 2) && el.tagName === 'H3' ? '2em' : 0
                gsap.to(el, { x: hoverX, duration: 0.5, ease: 'power2.out' })
            })
        })
        li.addEventListener('mouseleave', () => {
            targets.forEach((el, i) => gsap.to(el, { x: origX[i], duration: 0.5, ease: 'power2.out' }))
        })
    })

    gsap.set(lis, { clipPath: 'inset(0 100% 0 0)' })

    const rows = circlesRef.value?.querySelectorAll('div')
    if (!rows) return

    const midSpans = Array.from(rows).map(row => row.querySelectorAll('span')[2])
    const leftSpans = Array.from(rows).flatMap(row => [row.querySelectorAll('span')[0], row.querySelectorAll('span')[1]])
    const rightSpans = Array.from(rows).flatMap(row => [row.querySelectorAll('span')[3], row.querySelectorAll('span')[4]])

    const allSpans = circlesRef.value!.querySelectorAll('span')
    gsap.set(allSpans, { opacity: 0, backgroundColor: 'var(--blue)' })
    gsap.set(leftSpans, { x: '30vw' })
    gsap.set(rightSpans, { x: '-30vw' })

    tl = gsap.timeline({ delay: 1 })
    tl.to(midSpans, { opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, '-=0.3')
    tl.to(leftSpans, { opacity: 1, x: 0, duration: 1, stagger: 0.06, ease: 'power3.out' }, '-=0.3')
    tl.to(rightSpans, { opacity: 1, x: 0, duration: 1, stagger: 0.06, ease: 'power3.out' }, '<')
    tl.to(allSpans, { backgroundColor: 'transparent', duration: 1, ease: 'power2.out' }, '-=0.3')
    tl.to(lis, { clipPath: 'inset(0 0% 0 0)', duration: 0.75, ease: 'power3.out', stagger: 0.06 }, '-=0.5')
}

onMounted(async () => {
    gsap.set(ulRef.value, { visibility: 'hidden' })
    gsap.set(circlesRef.value, { visibility: 'hidden' })
    await contactStore.fetchContact()
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
                <h2>Address</h2>
                <template v-for="line in (contactStore.contact?.Address ?? '').split('\n')" :key="line">
                    <p>{{ line }}</p>
                </template>
            </li>
            <li v-for="member in contactStore.contact?.Team" :key="member.id">
                <h3>{{ member.Name }}</h3>
                <h4>{{ member.Title }}</h4>
                <a href="tel:{{ member.Phone }}">{{ member.Phone }}</a>
                <a href="mailto:{{ member.Email }}">{{ member.Email }}</a>
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
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    position: relative;
    z-index: 2;
    flex: 1;
    padding-bottom: 14em;
}

li {
    display: flex;
    flex-direction: column;
    padding-top: 4em;
        &:nth-child(2) {
            h4 {
                transform: translateX(2em);
            }
        }
        &:nth-child(3) {
            position: relative;
            top: -5.5em;
            h4 {
                transform: translateX(2em);
            }
        }
        &:nth-child(4) {
            text-align: center;
            h3 {
                transform: translateX(-10%);
            }
            h4 {
                transform: translateX(2%);
            }
        }
        &:nth-child(5) {
            text-align: center;
            h3 {
                transform: translateX(-20%);
            }
            h4 {
                transform: translateX(10%);
            }
        }
        &:nth-child(6) {
            h3 {
                transform: translateX(15%);
            }
            h4 {
                transform: translateX(10%);
            }
        }
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

h4 {
    max-width: 29ch;
}

li:nth-child(1) { grid-row: 1; grid-column: 1; }
li:nth-child(2) { grid-row: 1; grid-column: 2; }
li:nth-child(3) { grid-row: 2; grid-column: 3; }
li:nth-child(4) { grid-row: 3; grid-column: 2; }
li:nth-child(5) { grid-row: 3; grid-column: 4; }
li:nth-child(6) { grid-row: 4; grid-column: 3; }

@media (max-width: 768px) {
    section {
        position: static;
        height: auto;
        margin: 6em 2em 0;
    }
    ul {
        grid-template-columns: 1fr 1fr;
        padding-bottom: 4em;
    }
    li {
        padding-top: 2em;
        transform: none !important;
        text-align: left !important;
    }
    li:nth-child(n) { grid-row: auto; grid-column: auto; }
    li:nth-child(n) h3, li:nth-child(n) h4 { transform: none !important; }
    .circles { display: none; }
}
</style>