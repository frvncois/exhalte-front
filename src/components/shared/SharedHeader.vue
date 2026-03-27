<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
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

const route = useRoute()
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
        <button @click="toggleMenu">{{ menuOpen ? '( close )' : '( menu )' }}</button>
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
    </header>
    <section :class="{ 'hide-mobile': route.path === '/services' }">
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
    span:hover svg {
        transform: scaleX(1.1);
    }
    button {
        all: unset;
        cursor: pointer;
        display: none;
    }
}
nav {
    display: flex;
    gap: 2em;
    text-transform: uppercase;
    a:last-child, button {
        margin-left: 2em;
    }
}
svg {
    height: 2.15em;
    transition: transform 0.4s ease;
    transform-origin: left center;
}
section {
    position: absolute;
    inset: 0 0 auto 0;
    z-index: 18;
    ul {
        display: flex;
        margin-left: 15vw;
        padding: 2em;
        gap: 6em;
    }
}
h1, h2, p {
    font-size: var(--text-small);
    font-family: 'body';
    text-transform: uppercase;
    line-height: 1;
}
button {
    display: none;
}

@media (max-width: 900px) {
    section.hide-mobile {
        display: none;
    }

    header {
        padding: 4em 1em 0em 1em;
        button {
            display: inline;
        }
    }
    section {
        position: relative;
        ul {
            display: flex;
            flex-direction: column;
            gap: 2em;
            margin-top: 8em;
            margin-left: 0;
            padding: 1em;
        }
    }
    nav {
        display: none;
    }
}
</style>
