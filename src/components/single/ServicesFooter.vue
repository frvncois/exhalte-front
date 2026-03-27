<script setup lang="ts">
import MainLogo from '@/assets/MainLogo.vue';

</script>

<template>
    <section>
        <RouterLink to="/contact">( Contact us )</RouterLink>
        <MainLogo/>
    </section>
</template>


<style scoped>
section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8em;
    padding: 2em;
}
</style>