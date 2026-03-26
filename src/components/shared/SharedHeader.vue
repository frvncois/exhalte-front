<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import MainIcon from '@/assets/MainIcon.vue'
import {
    getHeaderToHeader, setHeaderToHeader,
    registerHeaderLeave, clearHeaderLeave,
} from '@/transitions/projectTransition'
import { useSharedStore } from '@/stores/shared'
import { useLocaleStore } from '@/stores/locale'

const logoRef = ref<HTMLElement | null>(null)
const navRef = ref<HTMLElement | null>(null)
const taglineRef = ref<HTMLElement | null>(null)

const sharedStore = useSharedStore()
const localeStore = useLocaleStore()
const titleParts = computed(() => (sharedStore.shared?.Title ?? '/').split('/'))
const taglineParts = computed(() => (sharedStore.shared?.Tagline ?? '/').split('/'))

const menuOpen = ref(false)
function toggleMenu() { menuOpen.value = !menuOpen.value }
function closeMenu() { menuOpen.value = false }

function onLocaleToggle() {
    localeStore.toggle()
}

onMounted(async () => {
    await sharedStore.fetchShared()

    if (getHeaderToHeader()) {
        setHeaderToHeader(false)
        return
    }
    const taglineEls = Array.from(taglineRef.value!.querySelectorAll('h1, h2, p'))
    const elements = [
        logoRef.value,
        ...taglineEls,
        ...Array.from(navRef.value!.children),
    ]
    gsap.from(elements, {
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        stagger: 0.08,
    })

    registerHeaderLeave((done) => {
        const taglineElsRev = Array.from(taglineRef.value!.querySelectorAll('h1, h2, p'))
        const els = [
            logoRef.value,
            ...taglineElsRev,
            ...Array.from(navRef.value!.children),
        ].reverse()
        gsap.to(els, {
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in',
            stagger: 0.05,
            onComplete: done,
        })
    })
})

const onNavClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('a')
    if (!target) return
    navRef.value?.querySelectorAll('a').forEach(a => a.classList.remove('active'))
    target.classList.add('active')
}

onUnmounted(() => {
    clearHeaderLeave()
})
</script>

<template>
    <header>
        <span ref="logoRef">
            <RouterLink to="/">
                <MainIcon />
            </RouterLink>
        </span>
        <nav ref="navRef" @click="onNavClick" :class="{ open: menuOpen }">
            <RouterLink to="/" @click="closeMenu">Index</RouterLink>
            <RouterLink to="/services" @click="closeMenu">Services</RouterLink>
            <RouterLink to="/contact" @click="closeMenu">Contact</RouterLink>
            <button @click.stop="onLocaleToggle">{{ localeStore.nextLabel }}</button>
        </nav>
        <button class="menu-toggle" @click="toggleMenu">{{ menuOpen ? '( close )' : '( menu )' }}</button>
    </header>
    <section>
        <ul ref="taglineRef">
            <li>
                <h1>{{ titleParts[0] }}</h1>
                <h2>{{ titleParts[1] }}</h2>
            </li>
            <li>
                <p>{{ taglineParts[0] }}</p>
                <p>{{ taglineParts[1] }}</p>
            </li>
        </ul>
    </section>

</template>

<style scoped>
header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
    padding: 2em;
    transition: color 0.4s ease;
}

header:has(a[href="/services"]:hover) {
    color: var(--pink);
}
nav {
    display: flex;
    gap: 2em;
    text-transform: uppercase;
    a:last-child, button {
        margin-left: 2em;
    }
}
button {
    all: unset;
    cursor: pointer;
}
.menu-toggle {
    display: none;
}
@media (max-width: 768px) {
    nav {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 19;
        background: var(--light);
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-end;
        padding: 2em;
        gap: 0.5em;
        a:last-child, button {
            margin-left: 0;
        }
    }
    nav.open {
        display: flex;
    }
    .menu-toggle {
        display: block;
        position: relative;
        z-index: 21;
    }
}
svg {
    height: 2.15em;
    transition: transform 0.4s ease;
    transform-origin: left center;
}

header span:hover svg {
    transform: scaleX(1.1);
}
section {
    position: absolute;
    inset: 0 0 auto 0;
    z-index: 18;
}
h1, h2, p {
    font-size: var(--text-small);
    font-family: 'body';
    text-transform: uppercase;
    line-height: 1;
}
ul {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 70ch;
    margin-left: 15vw;
    padding: 2em;
    gap: 4em;
}
</style>
