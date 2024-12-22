<script setup lang="ts">
import JSONg from 'jsong-audio';
import { inject, onMounted } from 'vue';
import {RouterLink, useRouter} from 'vue-router'
import About from './About.vue';

const router = useRouter()

const player = inject('jsong') as JSONg
function beginGame(){
  player.cancel()
  player.continue([2,0]).then(()=>{router.push('/game')})
}


</script>

<template>
  <main class="menu selection ">
    <div class="p-16 text-center">
      <h1 class="text-5xl text-green-600 m-8">Space-Time</h1>
      <button @click="beginGame()" class="text-xl hover:text-yellow-500 animate-pulse">New Game</button>
    </div>
    <!-- <router-link to="/about" class="text-xl hover:text-yellow-500">About</router-link> -->
     <About/>
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
