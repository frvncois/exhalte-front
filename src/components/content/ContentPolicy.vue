<script setup lang="ts">
import type { Policy } from '@/stores/policyContent'

defineProps<{ policy: Policy | null }>()

function blockText(children: { text: string }[]): string {
    return children.map(c => c.text).join('')
}
</script>

<template>
    <section>
        <h2>{{ policy?.Title }}</h2>
        <div v-for="(block, i) in policy?.Content" :key="i">
            <h3 v-if="block.type === 'heading'">{{ blockText(block.children) }}</h3>
            <p v-else>{{ blockText(block.children) }}</p>
        </div>
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
h3 {
    font-size: var(--text-sm);
    text-transform: uppercase;
    margin-bottom: 0.5em;
}
p {
    font-size: var(--text-sm);
    line-height: 1.6;
}
</style>
