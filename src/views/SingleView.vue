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

const { type } = storeToRefs(useProjectStore())
</script>

<template>
    <ShareClose />
    <div :class="type === 'gallery' ? 'is-gallery' : 'is-video'">
        <ContentGallery v-if="type === 'gallery'" />
        <ContentVideo v-else />
        <SharedProject />
    </div>
    <Content1col />
    <GridGallery />
    <ListCredits />
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
