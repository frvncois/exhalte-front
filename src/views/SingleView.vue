<script setup lang="ts">
import Content1col from '@/components/content/Content1col.vue';
import ContentVideo from '@/components/content/ContentVideo.vue';
import ContentGallery from '@/components/content/ContentGallery.vue';
import GridGallery from '@/components/grid/GridGallery.vue';
import ListCredits from '@/components/list/ListCredits.vue';
import ListProjects from '@/components/list/ListProjects.vue';
import SharedProject from '@/components/shared/SharedProject.vue';
import ShareClose from '@/components/shared/ShareClose.vue';
import { useProjectStore } from '@/stores/project';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { watch, onMounted, computed } from 'vue';

const route = useRoute()
const projectStore = useProjectStore()
const { type, activeProject } = storeToRefs(projectStore)

async function syncProject() {
    await projectStore.fetchProjects()
    projectStore.setActiveSlug(route.params.slug as string)
}

onMounted(syncProject)
watch(() => route.params.slug, syncProject)

const creditItems = computed(() =>
    activeProject.value?.Credit.map(c => ({
        label: c.Title,
        sub: c.Directory.map((d: { Name: string }) => d.Name).join(' · ') || null,
    })) ?? []
)

const remerciementItems = computed(() =>
    activeProject.value?.Remerciement.map(r => ({
        label: r.Name,
        sub: r.Website || null,
    })) ?? []
)

const awardsItems = computed(() =>
    (activeProject.value?.Awards ?? []).map((a: any) => ({ label: String(a) }))
)

const pressItems = computed(() =>
    (activeProject.value?.Press ?? []).map((p: any) => ({ label: String(p) }))
)
</script>

<template>
    <ShareClose />
    <div :class="type === 'gallery' ? 'is-gallery' : 'is-video'">
        <ContentGallery v-if="type === 'gallery'" />
        <ContentVideo v-else />
        <SharedProject />
    </div>
    <Content1col />
    <GridGallery :items="activeProject?.Gallery ?? []" />
    <ListCredits v-if="creditItems.length" title="Credits" :items="creditItems" />
    <ListCredits v-if="awardsItems.length" title="Awards" :items="awardsItems" />
    <ListCredits v-if="pressItems.length" title="Press" :items="pressItems" />
    <ListCredits v-if="remerciementItems.length" title="Remerciements" :items="remerciementItems" />
    <ListProjects />
</template>

<style scoped>
.is-video {
    display: flex;
    flex-direction: column;
}
.is-gallery {
    display: flex;
    flex-direction: row;
}
</style>
