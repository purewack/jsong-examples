<script setup lang="ts">
import JSONg from 'jsong-audio';
import { inject, onMounted } from 'vue';
import {RouterLink} from 'vue-router'
const player = inject('jsong') as JSONg

</script>

<template>
  <main class="menu selection flex gap-4 flex-col items-center justify-center h-screen">
    <h1 class="text-5xl text-green-600">Space-Time</h1>
    <router-link to="/game" @click="player.continue()" class="text-xl hover:text-yellow-500">New Game</router-link>
    <router-link to="/about" class="text-xl hover:text-yellow-500">About</router-link>
  </main>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>

<style scoped>
.menu{

}
</style>
