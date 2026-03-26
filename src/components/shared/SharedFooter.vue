<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { gsap } from 'gsap'
import MainLogo from '@/assets/MainLogo.vue';
import { themes } from '@/transitions/themes'
import { useContactStore } from '@/stores/contact'
import { useSharedStore } from '@/stores/shared'
import { usePolicyStore } from '@/stores/policyContent'
import { slugify } from '@/api/strapi'
import { registerPageLeave } from '@/transitions/projectTransition'

const props = withDefaults(defineProps<{
    logo?: boolean,
    address?: boolean,
    theme?: string,
}>(), {
    logo: true,
    address: true,
})

const contactStore = useContactStore()
const sharedStore = useSharedStore()
const policyStore = usePolicyStore()

const footerRef = ref<HTMLElement | null>(null)
const creditsContentRef = ref<HTMLElement | null>(null)
const parenLeftRef = ref<HTMLElement | null>(null)
const parenRightRef = ref<HTMLElement | null>(null)
const creditsOpen = ref(false)

function toggleCredits() {
    creditsOpen.value = !creditsOpen.value
    if (creditsOpen.value) {
        gsap.fromTo(parenLeftRef.value, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' })
        gsap.fromTo(parenRightRef.value, { opacity: 0, x: 6 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' })
        gsap.to(creditsContentRef.value, { height: 'auto', duration: 0.5, ease: 'power2.out' })
    } else {
        gsap.to(parenLeftRef.value, { opacity: 0, x: -6, duration: 0.25, ease: 'power2.in' })
        gsap.to(parenRightRef.value, { opacity: 0, x: 6, duration: 0.25, ease: 'power2.in' })
        gsap.to(creditsContentRef.value, { height: 0, duration: 0.4, ease: 'power2.in' })
    }
}
const logoRef = ref<HTMLElement | null>(null)
const addressRef = ref<HTMLElement | null>(null)
const bottomRef = ref<HTMLElement | null>(null)
const route = useRoute()
let observer: IntersectionObserver | null = null
let logoObserver: IntersectionObserver | null = null
let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

onMounted(async () => {
    contactStore.fetchContact()
    sharedStore.fetchShared()
    policyStore.fetchPolicies()

    if (logoRef.value) {
        const el = logoRef.value
        const svg = el.querySelector('svg')!
        const h = svg.getBoundingClientRect().height
        gsap.set(el, { clipPath: `inset(0 0 ${h}px 0)` })
        logoObserver = new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) {
                gsap.to(el, {
                    clipPath: 'inset(0 0 0px 0)',
                    duration: 2,
                    delay: 0.5,
                    ease: 'power3.out',
                })
                logoObserver?.disconnect()
            }
        }, { threshold: 0.1 })
        logoObserver.observe(el)
    }

    const fadeEls = [addressRef.value, bottomRef.value].filter(Boolean) as HTMLElement[]
    fadeEls.forEach((el, i) => {
        gsap.set(el, { opacity: 0 })
        const obs = new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) {
                gsap.to(el, { opacity: 1, duration: 1.5, delay: i * 0.3, ease: 'power2.out' })
                obs.disconnect()
            }
        }, { threshold: 0.5 })
        obs.observe(el)
    })

    unregisterLeave = registerPageLeave((done) => {
        gsap.to(footerRef.value, { opacity: 0, duration: 0.4, ease: 'power2.in', onComplete: done })
    })

    if (!props.theme) return

    observer = new IntersectionObserver(([entry]) => {
        document.body.style.transition = 'background 1s ease, color 1s ease'
        document.body.style.color = ''
        if (entry?.isIntersecting) {
            const allBodyClasses = Object.values(themes).map(t => t.bodyClass).filter(Boolean) as string[]
            document.body.classList.remove(...allBodyClasses)
            document.body.classList.add(props.theme!)
        } else {
            document.body.classList.remove(props.theme!)
            const routeTheme = themes[route.path]
            if (routeTheme?.bodyClass) document.body.classList.add(routeTheme.bodyClass)
        }
        setTimeout(() => { document.body.style.transition = '' }, 1000)
    }, { threshold: 0.1 })

    observer.observe(footerRef.value!)
})

onUnmounted(() => {
    observer?.disconnect()
    logoObserver?.disconnect()
})
</script>

<template>
    <footer ref="footerRef">
        <div v-if="logo" ref="logoRef" class="logo">
            <MainLogo />
        </div>
        <address v-if="address" ref="addressRef">
            <p style="white-space: pre-line">{{ contactStore.contact?.Address }}</p>
            <p>{{ contactStore.contact?.Phone }}</p>
            <nav>
                <a :href="contactStore.contact?.Instagram ?? '#'">IN</a>
                <a :href="contactStore.contact?.Linkedin ?? '#'">LKN</a>
            </nav>
        </address>
        <div class="bottom" ref="bottomRef">
            <div>
                <p>{{ sharedStore.shared?.Copyright }}</p>
                <nav>
                    <RouterLink
                        v-for="policy in policyStore.policies"
                        :key="policy.documentId"
                        :to="`/policy/${slugify(policy.Title)}`"
                    >{{ policy.Title }}</RouterLink>
                </nav>
            </div>
            <div class="credits">
                <span class="credits-toggle" @click="toggleCredits"><span ref="parenLeftRef" class="paren-extra">(</span>( Credits )<span ref="parenRightRef" class="paren-extra">)</span></span>
                <div ref="creditsContentRef" class="credits-content">
                    <a href="https://hayleylim.com/" target="_blank">Branding / Hayley Lim</a>
                    <a href="https://www.lab-a.me/" target="_blank">Web design / Hayley Lim</a>
                    <a href="https://frvncois.com" target="_blank">Web development/ Francois Lemieux</a>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
footer {
    display: flex;
    gap: 16em;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 2em;
}

address {
    display: flex;
    align-items: center;
    flex-direction: column;
    text-align: center;
    font-size: var(--text-medium);
    text-transform: uppercase;
    line-height: 1.5;
    p:first-child {
        font-family: 'heading';
    }
}

nav {
    display: flex;
    gap: 1rem;
    a {
        transition: opacity 0.4s ease;
    }
    & a:hover {
        opacity: 0.65;
    }
}
.logo {
    margin-top: 16em;
    height: 100%;
    width: 100%;
}

svg {
    display: block;
}

.bottom {
    display: flex;
    justify-content: space-between;
    align-items: end;
    width: 100%;
    position: relative;
    & p, a, span {
        font-size: var(--text-sm);
        text-transform: uppercase;
    }
}
.credits {
    display: flex;
    flex-direction: column;
    align-items: end;
    position: absolute;
    right: 0;
    bottom: 0;
}
.credits-toggle {
    cursor: pointer;
    display: flex;
    align-items: center;
}
.paren-extra {
    opacity: 0;
}
.credits-content {
    display: flex;
    flex-direction: column;
    align-items: end;
    overflow: hidden;
    height: 0;
}
@media (max-width: 768px) {
    footer { gap: 8em; }
    .logo { margin-top: 8em; }
    address { font-size: var(--text-sm); }
    .bottom { flex-direction: column; gap: 2em; align-items: start; }
    .credits { position: static; align-items: start; }
    .credits-content { align-items: start; }
}
</style>
