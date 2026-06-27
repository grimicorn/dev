<script setup lang="ts">
import { useData } from "vitepress";
import GrimicornPage from "./components/GrimicornPage.vue";
import NotFound from "./components/NotFound.vue";

const { page } = useData();
</script>

<template>
  <NotFound v-if="page.isNotFound" />
  <GrimicornPage v-else />
</template>
