<script setup>
import {RouterView, useRoute, useRouter} from 'vue-router'
import JSONg from "jsong-audio"
import { onMounted, provide, ref, toRaw, watch } from "vue";
import Game from './pages/Game.vue';


// const loaded = ref(false)
const loaded = ref(false)

const jsong = ref(new JSONg(undefined,{debug:true}))
provide('jsong',toRaw(jsong.value))

const route = useRoute()
const router = useRouter()

watch(route, (to)=>{
  console.log("route changed" )
  const j = toRaw(jsong.value)
  if(!loaded.value){
    router.push('/')
  }
  else if(to.path === '/'){
    if(j.state != 'playing')
      j.cancel()
    j.overrideCurrent([1],2)
  }
  else if(to.path === '/game'){
    j.cancel()
    j.continue([2,0])
  }
})

function audioOk(){
  const j = toRaw(jsong.value)
  const path = 'vue/space.jsong'
  j.parseManifest(path).then(m => {
    console.log(m)
    j.useManifest(m,{click:false}).then(()=>{
      loaded.value = true
      j.play()
      // player.trackVolumeControls['extra'].volume.value = -200
    })
  })
}
</script>

<template>
  <div class="bg-container">
    <div class="bg move" :class="[loaded && 'move', $route.path === '/game' && 'fast', $route.path === '/about' && 'about']"></div>
  </div>
  <RouterView v-if="loaded" />
  <main v-else class="flex flex-col gap-4 justify-center items-center h-screen text-center bg">
    <i>This game requires audio to play</i> <br/>
    Click the button to allow audio <br/>
    <button @click="audioOk" class="bg-blue-900 text-blue-200 w-max p-4">OK !</button>
  </main>
  <!-- <Game/> -->
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Doto:wght@100..900&family=Press+Start+2P&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;


body {
  color: white;
  background-color: black;
 

  font-family: "Press Start 2P", monospace;
  font-weight: 400;
  font-style: normal;
}

.bg-container {
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: -10;
}

.bg {
  position: relative;
  top:0;
  height: 100%;
  width: 100%;
  background-size: 400px 400px;
  background-image: url('/vue/bg.png');
  image-rendering:pixelated;

  transform-origin: 100% 0;
  scale: 1 1;
  transition: scale 3s;
}

.bg.move {
  animation-duration: 4s; 
  animation-name: move-bg;
  animation-fill-mode: both;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

.bg.fast{
  animation-duration: 4s; 
  scale: 1 2.5;
}
.bg.about{
  animation-duration: 8s; 
  scale: 1 1.25; 
}
@keyframes move-bg {
  to {
    background-position: 0px 400px;
  }
}

.font-main{
  font-family: "Press Start 2P", monospace;
  font-weight: 400;
  font-style: normal;
}

.font-dot{
  font-family: "Doto", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
  font-variation-settings:
    "ROND" 0;
}
</style>
