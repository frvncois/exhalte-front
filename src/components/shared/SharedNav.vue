<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { gsap } from 'gsap'
import { useRouter } from 'vue-router'
import MainLogo from '@/assets/MainLogo.vue'
import { useContactStore } from '@/stores/contact'
import { useLocaleStore } from '@/stores/locale'
import { triggerPageLeave } from '@/transitions/projectTransition'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const contactStore = useContactStore()
const localeStore = useLocaleStore()
const router = useRouter()

const navRef = ref<HTMLElement | null>(null)
const linksRef = ref<HTMLElement | null>(null)
const bottomRef = ref<HTMLElement | null>(null)

contactStore.fetchContact()

onMounted(() => {
    gsap.set(navRef.value, { clipPath: 'inset(0 0 100% 0)', display: 'none' })
})

watch(() => props.open, (isOpen) => {
    const el = navRef.value
    if (!el) return

    if (isOpen) {
        const links = Array.from(linksRef.value?.children ?? [])
        const bottom = Array.from(bottomRef.value?.children ?? [])
        gsap.set(el, { display: 'flex', clipPath: 'inset(0 0 100% 0)' })
        gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power4.out' })
        gsap.fromTo([...links, ...bottom],
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.07, ease: 'power4.out', delay: 0.25 }
        )
    } else {
        clipOut(() => gsap.set(el, { display: 'none' }))
    }
})

function clipOut(onComplete?: () => void) {
    const el = navRef.value
    if (!el) { onComplete?.(); return }
    gsap.to(el, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1,
        ease: 'power3.in',
        onComplete,
    })
}

function navigate(to: string) {
    clipOut(() => {
        emit('close')
        triggerPageLeave(() => {
            router.push(to)
        })
    })
}
</script>

<template>
    <Teleport to="body">
        <nav ref="navRef">
            <div class="top" ref="linksRef">
                <a @click.prevent="navigate('/projects')">Projects</a>
                <a @click.prevent="navigate('/services')">Services</a>
                <a @click.prevent="navigate('/contact')">Contact</a>
            </div>
            <div class="bottom" ref="bottomRef">
                <div class="logo">
                    <MainLogo />
                </div>
                <div class="info">
                    <p style="white-space: pre-line">{{ contactStore.contact?.Address }}</p>
                    <p>{{ contactStore.contact?.Phone }}</p>
                </div>
                <div class="actions">
                    <button @click="localeStore.toggle()">{{ localeStore.nextLabel }}</button>
                    <div>
                        <a :href="contactStore.contact?.Instagram ?? '#'" target="_blank">In</a>
                        <a :href="contactStore.contact?.Linkedin ?? '#'" target="_blank">Lkn</a>
                    </div>
                </div>
            </div>
        </nav>
    </Teleport>
</template>

<style scoped>
nav {
    position: fixed;
    inset: 0;
    z-index: 19;
    background: var(--olive);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 8em 1em 2em;
    color: var(--white);
}

.top {
    display: flex;
    flex-direction: column;
    gap: 1em;
    a {
        font-family: 'body';
        text-transform: uppercase;
        cursor: pointer;
        line-height: 1;
        transition: opacity 0.2s ease;
        &:hover { opacity: 0.5; }
    }
}

.bottom {
    display: flex;
    flex-direction: column;
    gap: 1.5em;
}

.logo {
    width: 100%;
    svg { width: 100%; display: block; }
}

.info {
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    line-height: 1;
}

.actions {
    display: flex;
    gap: 1.5em;
    align-items: center;
    text-transform: uppercase;
    justify-content: space-between;
    button {
        all: unset;
        cursor: pointer;
        transition: opacity 0.2s ease;
        &:hover { opacity: 0.5; }
    }
    a {
        transition: opacity 0.2s ease;
        &:hover { opacity: 0.5; }
    }
    div {
        display: flex;
        gap: 2em;
    }
}
</style>
