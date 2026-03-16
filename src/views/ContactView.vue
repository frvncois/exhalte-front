<script setup lang="ts">
import SharedHeader from '@/components/shared/SharedHeader.vue';
import SharedFooter from '@/components/shared/SharedFooter.vue';
import GridContact from '@/components/grid/GridContact.vue';

</script>

<template>
    <SharedHeader />
    <main>
        <GridContact />
        <SharedFooter :address="false" :logo="false" />
    </main>
</template>

<style scoped>
main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}
</style>