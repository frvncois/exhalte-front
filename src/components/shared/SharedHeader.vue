<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { gsap } from 'gsap'
import MainIcon from '@/assets/MainIcon.vue'
import SharedNav from '@/components/shared/SharedNav.vue'
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
    <header>
        <div class="blur-stack" aria-hidden="true">
            <div class="blur-layer blur-1"></div>
            <div class="blur-layer blur-2"></div>
            <div class="blur-layer blur-3"></div>
            <div class="blur-layer blur-4"></div>
            <div class="blur-layer blur-5"></div>
            <div class="blur-layer blur-6"></div>
            <div class="blur-layer blur-7"></div>
            <div class="blur-layer blur-8"></div>
        </div>
        <button @click="toggleMenu"></button>
        <span ref="logoRef">
            <RouterLink to="/">
                <MainIcon />
            </RouterLink>
        </span>
        <nav ref="navRef">
            <RouterLink to="/" @click="closeMenu">Index</RouterLink>
            <RouterLink to="/services" @click="closeMenu">Services</RouterLink>
            <RouterLink to="/contact" @click="closeMenu">Contact</RouterLink>
            <button @click.stop="localeStore.toggle">{{ localeStore.nextLabel }}</button>
        </nav>
    </header>
    <SharedNav :open="menuOpen" @close="closeMenu" />
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
    > button {
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


.blur-stack {
    display: none;
}

@media (max-width: 900px) {
    .blur-stack {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    }
    .blur-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    .blur-1 {
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        mask-image: linear-gradient(to bottom, black 0%, transparent 12.5%);
        -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 12.5%);
    }
    .blur-2 {
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        mask-image: linear-gradient(to bottom, black 0%, transparent 25%);
        -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 25%);
    }
    .blur-3 {
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        mask-image: linear-gradient(to bottom, black 0%, transparent 37.5%);
        -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 37.5%);
    }
    .blur-4 {
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        mask-image: linear-gradient(to bottom, black 0%, transparent 50%);
        -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 50%);
    }
    .blur-5 {
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        mask-image: linear-gradient(to bottom, black 0%, transparent 62.5%);
        -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 62.5%);
    }
    .blur-6 {
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        mask-image: linear-gradient(to bottom, black 0%, transparent 75%);
        -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 75%);
    }
    .blur-7 {
        backdrop-filter: blur(32px);
        -webkit-backdrop-filter: blur(32px);
        mask-image: linear-gradient(to bottom, black 0%, transparent 87.5%);
        -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 87.5%);
    }
    .blur-8 {
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
        mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
        -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
    }

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
