<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import type { Policy } from '@/api/strapi'

const props = defineProps<{ policy: Policy | null }>()

const html = computed(() => {
    const blocks = props.policy?.Content ?? []
    const text = blocks.map((block: any) =>
        (block.children ?? []).map((c: any) => c.text ?? '').join('')
    ).join('\n\n')
    return marked(text) as string
})
</script>

<template>
    <section>
        <h2>{{ policy?.Title }}</h2>
        <div class="content" v-html="html" />
    </section>
</template>

<style scoped>
section {
    max-width: 70ch;
    margin: 0 auto;
    padding: 16em 2em 4em;
    display: flex;
    flex-direction: column;
    gap: 2em;
}
h2 {
    font-size: var(--text-regular);
    text-transform: uppercase;
}
.content :deep(h1),
.content :deep(h2),
.content :deep(h3) {
    font-size: var(--text-sm);
    text-transform: uppercase;
    margin-bottom: 0.5em;
}
.content :deep(p) {
    font-size: var(--text-sm);
    line-height: 1.6;
    margin-bottom: 1em;
}
.content :deep(ul),
.content :deep(ol) {
    font-size: var(--text-sm);
    line-height: 1.6;
    padding-left: 1.5em;
    margin-bottom: 1em;
}
</style>
