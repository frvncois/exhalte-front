<script setup lang="ts">
import { ref } from 'vue'
import AppLoad from '@/components/transition/AppLoad.vue'
import RouteChange from './components/transition/RouteChange.vue';

const viewReady = ref(document.body.classList.contains('app-loaded'))
</script>

<template>
    <AppLoad @ready="viewReady = true" />
    <RouteChange />
    <RouterView v-if="viewReady" />
</template>
