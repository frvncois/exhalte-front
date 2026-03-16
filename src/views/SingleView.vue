<script setup lang="ts">
import Content1col from '@/components/content/Content1col.vue';
import ContentVideo from '@/components/content/ContentVideo.vue';
import GridGallery from '@/components/grid/GridGallery.vue';
import ListCredits from '@/components/list/ListCredits.vue';
import ListProjects from '@/components/list/ListProjects.vue';
import SharedProject from '@/components/shared/SharedProject.vue';
import ShareClose from '@/components/shared/ShareClose.vue';
</script>

<template>
    <ShareClose />
    <ContentVideo />
    <SharedProject />
    <Content1col />
    <GridGallery />
    <ListCredits />
    <ListProjects />
</template>
