<script setup lang="ts">
import { ref } from 'vue'
import AppLoad from '@/components/transition/AppLoad.vue'
import RouteTransition from '@/components/transition/RouteTransition.vue'

const viewReady = ref(document.body.classList.contains('app-loaded'))
</script>

<template>
    <AppLoad @ready="viewReady = true" />
    <RouterView v-if="viewReady" :key="$route.fullPath" />
    <RouteTransition />
</template>
