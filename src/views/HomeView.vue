<script setup lang="ts">
import SharedHeader from '@/components/shared/SharedHeader.vue';
import GridProjects from '@/components/grid/GridProjects.vue';
import SharedFooter from '@/components/shared/SharedFooter.vue';
import AppLoad from '@/components/transition/AppLoad.vue';

</script>

<template>
    <SharedHeader />
    <GridProjects />
    <SharedFooter theme="theme-pink" />
    <AppLoad/>
</template>x