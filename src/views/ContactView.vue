<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import SharedHeader from '@/components/shared/SharedHeader.vue';
import SharedFooter from '@/components/shared/SharedFooter.vue';
import GridContact from '@/components/grid/GridContact.vue';
import lenis from '@/lib/lenis'

const themes = ['theme-blue', 'theme-purple', 'theme-yellow', 'theme-gray'] as const

function getThemeIndex() {
    const vh = window.innerHeight
    const idx = Math.floor(window.scrollY / vh)
    return Math.min(idx, themes.length - 1)
}

function applyTheme() {
    const body = document.body
    body.style.color = ''
    body.classList.remove(...themes)
    body.classList.add(themes[getThemeIndex()] as string)
}

onMounted(() => {
    setTimeout(applyTheme, 150)
    lenis.on('scroll', applyTheme)
})

onUnmounted(() => {
    lenis.off('scroll', applyTheme)
})
</script>

<template>
    <SharedHeader />
    <main>
        <GridContact />
        <div class="footer-content">
            <SharedFooter :address="false" :logo="false" />
        </div>
    </main>
</template>

<style scoped>
main {
    min-height: 400vh;
    display: flex;
    flex-direction: column;
}
.footer-content {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index:10;
}
</style>