<script setup>
import {RouterView, useRouter} from 'vue-router'
import JSONg from "jsong-audio"
import { onMounted, provide, ref } from "vue";

const loaded = ref(false)
// const loaded = ref(true)

const player = new JSONg()
provide('jsong',player)

const router = useRouter()
onMounted(async ()=>{
  loaded.value = false
  router.push('/')
  player.continue([0])
})

function audioOk(){
  player.parseManifest('space.jsong').then(m => {
    console.log(m)
    player.useManifest(m).then(()=>{
      loaded.value = true
      player.play()
      // player.trackVolumeControls['extra'].volume.value = -200
    })
  })
}
</script>

<template>
  <div class="bg-container">
    <div class="bg move" :class="[loaded && 'move', $route.path === '/game' && 'fast', $route.path === '/about' && 'about']"></div>
  </div>
  <RouterView  v-if="loaded" />
  <main v-else class="flex flex-col gap-4 justify-center items-center h-screen text-center bg">
    <i>This game requires audio to play</i> <br/>
    Click the button to allow audio <br/>
    <button @click="audioOk" class="bg-blue-900 text-blue-200 w-max p-4">OK !</button>
  </main>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Doto:wght@100..900&family=Press+Start+2P&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  color: white;
  background-color: black;
 

  font-family: "Press Start 2P", system-ui;
  font-weight: 400;
  font-style: normal;
}

.bg-container {
  position: fixed;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  z-index: -10;
}

.bg {
  position: relative;
  top:0;
  height: 100%;
  width: 100%;
  background-size: 200px;
  /* background-image: url('bg.png'); */
  image-rendering:pixelated;

  transform-origin: 100% 0;
  scale: 1 1;
  transition: scale 3s;
}

.bg.move {
  animation-duration: 20s; 
  animation-name: move-bg;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

.bg.fast{
  animation-duration: 10s; 
  scale: 1 2;
}
.bg.about{
  animation-duration: 8s; 
  scale: 1 1.25; 
}
@keyframes move-bg {
  to {
    background-position: 0px 2000px;
  }
}


.font-dot{
  font-family: "Doto", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
  font-variation-settings:
    "ROND" 0;
}
</style>
