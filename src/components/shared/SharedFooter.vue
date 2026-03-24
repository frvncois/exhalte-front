<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { gsap } from 'gsap'
import MainLogo from '@/assets/MainLogo.vue';
import { themes } from '@/transitions/themes'
import { getContact, type Contact } from '@/api/strapi'
import { registerPageLeave } from '@/transitions/projectTransition'

const props = withDefaults(defineProps<{
    logo?: boolean,
    address?: boolean,
    theme?: string,
}>(), {
    logo: true,
    address: true,
})

const contact = ref<Contact | null>(null)

const footerRef = ref<HTMLElement | null>(null)
const logoRef = ref<{ $el: SVGElement } | null>(null)
const addressRef = ref<HTMLElement | null>(null)
const bottomRef = ref<HTMLElement | null>(null)
const route = useRoute()
let observer: IntersectionObserver | null = null
let logoObserver: IntersectionObserver | null = null
let unregisterLeave: (() => void) | null = null
onBeforeUnmount(() => unregisterLeave?.())

onMounted(async () => {
    try { contact.value = await getContact() } catch {}

    if (logoRef.value) {
        const el = logoRef.value.$el
        gsap.set(el, { clipPath: 'inset(0 0 100% 0)' })
        logoObserver = new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) {
                gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 2, delay: 0.5, ease: 'power3.out' })
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
        <MainLogo v-if="logo" ref="logoRef" />
        <address v-if="address" ref="addressRef">
            <p style="white-space: pre-line">{{ contact?.Address }}</p>
            <p>{{ contact?.Phone }}</p>
            <nav>
                <a :href="contact?.Instagram ?? '#'">IN</a>
                <a :href="contact?.Linkedin ?? '#'">LKN</a>
            </nav>
        </address>
        <div class="bottom" ref="bottomRef">
            <div>
                <p>©2026 all rights reserved</p>
                <nav>
                    <RouterLink to="/">Cookies policy</RouterLink>
                    <RouterLink to="/">Legal advice</RouterLink>
                    <RouterLink to="/">AI policy</RouterLink>
                    <RouterLink to="/">Privacy policy</RouterLink>
                </nav>
            </div>
            <div>
                <span>[ Credits ]</span>
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
    gap: 0.25em;
    font-size: var(--text-medium);
}

nav {
    display: flex;
    gap: 1rem;
}
svg {
    margin-top: 16em;
}

.bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    & p, a, span {
        font-size: var(--text-sm);
        text-transform: uppercase;
    }
}
</style>
