<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { gsap } from 'gsap'
import MainIcon from '@/assets/MainIcon.vue'
import SharedNav from '@/components/shared/SharedNav.vue'
import ManifestoSheet from '@/components/content/ManifestoSheet.vue'
import {
    getHeaderToHeader, setHeaderToHeader,
    registerHeaderLeave, clearHeaderLeave,
} from '@/transitions/projectTransition'
import { useSharedStore } from '@/stores/shared'
import { useLocaleStore } from '@/stores/locale'
import { themes } from '@/transitions/themes'

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

const manifestoOpen = ref(false)

const currentThemeBg = computed(() => {
    const path = route.path.startsWith('/projects/') ? '/projects/:slug' : route.path
    return themes[path]?.bg ?? ''
})

onMounted(() => {
    sharedStore.fetchShared()

    if (getHeaderToHeader()) {
        setHeaderToHeader(false)
        return
    }

    const taglineEls = Array.from(taglineRef.value!.querySelectorAll('h1, h2, p'))
    const navEls = Array.from(navRef.value!.children)

    gsap.from([logoRef.value, ...taglineEls, ...navEls], {
        opacity: 0, duration: 1, ease: 'power2.out', stagger: 0.08,
    })

    registerHeaderLeave((done) => {
        gsap.to([logoRef.value, ...taglineEls, ...navEls].reverse(), {
            opacity: 0, duration: 0.25, ease: 'power2.in', stagger: 0.05, onComplete: done,
        })
    })
})


onUnmounted(() => {
    clearHeaderLeave()
})
</script>

<template>
    <header :style="manifestoOpen ? { color: currentThemeBg } : (menuOpen ? { color: 'white' } : {})">
        <span ref="logoRef">
            <RouterLink to="/">
                <MainIcon />
            </RouterLink>
        </span>
        <button @click="toggleMenu"></button>
        <nav ref="navRef" @click="manifestoOpen = false">
            <RouterLink to="/projects" @click="closeMenu">{{ localeStore.locale === 'fr' ? 'Projets' : 'Projects' }}</RouterLink>
            <RouterLink to="/services" @click="closeMenu">Services</RouterLink>
            <RouterLink to="/contact" @click="closeMenu">Contact</RouterLink>
            <button @click.stop="localeStore.toggle">{{ localeStore.nextLabel }}</button>
        </nav>
    </header>
    <SharedNav :open="menuOpen" @close="closeMenu" />
    <ManifestoSheet :open="manifestoOpen" @close="manifestoOpen = false" />
    <section :class="{ 'hide-mobile': route.path === '/services' || route.path === '/contact' }" :style="manifestoOpen ? { color: currentThemeBg } : {}">
        <ul ref="taglineRef">
            <li @click.stop="manifestoOpen = !manifestoOpen">
                <h1>{{ titleParts[0] }}</h1>
                <h2>{{ titleParts[1] }}</h2>
            </li>
            <li @click.stop="manifestoOpen = !manifestoOpen">
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
    pointer-events: none;
    > span, > nav {
        pointer-events: auto;
    }
    span:hover svg {
        transform: scaleX(1.1);
    }
    > button {
        all: unset;
        cursor: pointer;
        display: none;
        pointer-events: auto;
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
        cursor: pointer;
    }
}
h1, h2, p {
    font-size: var(--text-sm);
    font-family: 'body';
    text-transform: uppercase;
    line-height: 1;
}

@media (max-width: 900px) {

    section.hide-mobile {
        display: none;
    }

    header {
        padding: 4em 1em 0em 1em;
        align-items: center;
        button {
            display: inline;
            height: 1em;
            width: 1em;
            border-radius: 100%;
            background: currentColor;
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
