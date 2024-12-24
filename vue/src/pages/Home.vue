<script setup lang="ts">
import JSONg from 'jsong-audio';
import { inject, onMounted, ref } from 'vue';
import {RouterLink, useRouter} from 'vue-router'
import About from './About.vue';

const fadeTime = ref(0)

const router = useRouter()

const player = inject('jsong') as JSONg

function beginGame(){
  try{
  player.cancel()
  }catch{}

  const [currentBeat, totalBeats] = player.getPosition().section
  fadeTime.value =  player.timingInfo.beatDuration * totalBeats - currentBeat
  player.continue([2,0]).then(()=>{
    router.push('/game')
  })
}


</script>

<template>
  <main class="menu selection" :class="fadeTime && 'ready'" :style="{'--dt':fadeTime+'s'}">
    <div class="p-16 text-center">
      <h1 class="text-5xl text-green-600 m-8">Space-Time</h1>
      <button @click="beginGame()" class="text-xl hover:text-yellow-500 animate-pulse">New Game</button>
    </div>
     <About class="about" :class="fadeTime && 'ready'" />
  </main>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>

<style scoped>
.menu {
  display:grid;
  grid-template-rows: 33vh 1fr;
  transition: grid-template-rows var(--dt);
  place-items: center;
}
.menu.ready{
  grid-template-rows: 100vh 0fr;
}
.about{
  transition: opacity var(--dt);
}
.about.ready {
  opacity: 0;
}
</style>
