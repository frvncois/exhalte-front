<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { gsap } from 'gsap'
import { marked } from 'marked'
import { themes } from '@/transitions/themes'
import { useManifestoStore } from '@/stores/manifesto'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const manifestoStore = useManifestoStore()
function blocksToMarkdown(blocks: any[]): string {
    return blocks.map(block => {
        if (block.type === 'heading') {
            const prefix = '#'.repeat(block.level)
            const text = (block.children ?? []).map((c: any) => c.text ?? '').join('')
            return `${prefix} ${text}`
        }
        if (block.type === 'list') {
            return (block.children ?? []).map((item: any, i: number) => {
                const text = (item.children ?? []).map((c: any) => c.text ?? '').join('')
                return block.format === 'ordered' ? `${i + 1}. ${text}` : `- ${text}`
            }).join('\n')
        }
        return (block.children ?? []).map((c: any) => c.text ?? '').join('')
    }).join('\n\n')
}

const html = computed(() => marked(blocksToMarkdown(manifestoStore.manifesto?.Content ?? [])) as string)

const sheetRef = ref<HTMLElement | null>(null)
const route = useRoute()

function currentTheme() {
    const path = route.path.startsWith('/projects/') ? '/projects/:slug' : route.path
    return themes[path]
}

function handleOutsideClick() {
    emit('close')
}

onMounted(() => {
    gsap.set(sheetRef.value, { clipPath: 'inset(0 0 100% 0)', display: 'none' })
})

onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick)
})

watch(() => props.open, (isOpen) => {
    const el = sheetRef.value
    if (!el) return
    if (isOpen) {
        const theme = currentTheme()
        gsap.set(el, { display: 'block', clipPath: 'inset(0 0 100% 0)', backgroundColor: theme?.color ?? 'var(--gray)', color: theme?.bg ?? '' })
        gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 2, ease: 'power4.inOut' })
        nextTick(() => document.addEventListener('click', handleOutsideClick))
    } else {
        document.removeEventListener('click', handleOutsideClick)
        gsap.to(el, {
            clipPath: 'inset(0 0 100% 0)',
            duration: 1,
            ease: 'power3.in',
            onComplete: () => { gsap.set(el, { display: 'none' }) },
        })
    }
})
</script>

<template>
    <Teleport to="body">
        <div ref="sheetRef" class="sheet">
            <div v-html="html" />
        </div>
    </Teleport>
</template>

<style scoped>
.sheet {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 15;
    padding-top: 8em;
    padding-right: 20vw;
    padding-bottom: 6em;
    padding-left: 16.65vw;
    overflow-y: auto;
    max-height: 100vh;
    div {
        display: flex;
        flex-direction: column;
        gap: 1em;
    }
}
.sheet :deep(ol) {
    list-style-type: decimal;
    padding-left: 1.5em;
    margin-bottom: 1em;
}
.sheet :deep(ul) {
    list-style-type: disc;
    padding-left: 1.5em;
    margin-bottom: 1em;
}
.sheet :deep(li) {
    display: list-item;
}

@media (max-width: 900px) {
    .sheet {
        padding: 18em 1em 4em 1em;
    }
}
</style>
