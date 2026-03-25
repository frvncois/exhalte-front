<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ContentPolicy from '@/components/content/ContentPolicy.vue'
import SharedFooter from '@/components/shared/SharedFooter.vue'
import { usePolicyStore } from '@/stores/policyContent'
import SharedHeader from '@/components/shared/SharedHeader.vue'

const route = useRoute()
const policyStore = usePolicyStore()
const policy = computed(() => policyStore.getBySlug(route.params.slug as string))

onMounted(() => policyStore.fetchPolicies())
</script>

<template>
    <SharedHeader />
    <ContentPolicy :policy="policy" />
    <SharedFooter :logo="false" :address="false" />
</template>
