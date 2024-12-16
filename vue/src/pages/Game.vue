<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, toRaw, watch } from 'vue';
import JSONg from 'jsong-audio';
import { ChangeEvent, QueueEvent } from 'jsong-audio/dist/types/events';
import Phaser from '@/game/Phaser.vue';
import { EventBus } from '@/game/events';

const jsong = inject('jsong') as JSONg
const phaserRef = ref()
const health = ref(100)
const energy = ref(100)
const killCount = ref(0)
const killTarget = ref(20)
const gamePhase = ref('avoid')

EventBus.addListener('player-hit',()=>{
    health.value -= 10
})
EventBus.addListener('enemy-hit',()=>{
})

EventBus.addListener('player-collect-power',()=>{
    energy.value += 10
})

jsong.addEventListener('queue',(ev: QueueEvent)=>{
    console.log("queue",ev.to, ev.from)
    const timeTo = ev.timeUntil * 1000
    // if(ev.to?.name === 'bridge1') {
    //     s.animateDespawn(timeTo/2).then(()=>{
    //         s.createCapture(timeTo/2)
    //     })
    // }
})
jsong.addEventListener('change',(ev: ChangeEvent)=>{
    console.log("change",ev.to, ev.from)
    // if(ev.to?.name === 'avoid' && ev.from?.name !== 'idle') 
    // if(ev.to?.name === 'bridge1end') EventBus.emit('change-game-')
})

const queuedScene = ref('')
function scene(to){
    queuedScene.value = to
    EventBus.emit('end-scene')
}
EventBus.on('current-scene-end',()=>{
    const scene = toRaw(phaserRef.value.scene)
    scene.changeScene(queuedScene.value)
})
EventBus.on('current-scene-ready',(s)=>{
    console.log('ready scene',s)
    gamePhase.value = s.scene.key
})

function next(){
    if(gamePhase.value === 'avoid')
        scene('shoot')
    if(gamePhase.value === 'shoot')
        scene('boss')
    if(gamePhase.value === 'boss')
        scene('avoid')
}


gamePhase.value = 'avoid'
</script>

<template>
    <main class="w-full h-full phaser-container bg-red-400">
        <Phaser ref="phaserRef"/>
        <!-- <div class="vignette"></div> -->
    </main>
    <section class="fixed z-50 top-0 left-0 right-0 flex justify-between">
        <div :style="{'--value':health / 100}" class="bar">Health {{ health }}</div>
        <div v-if="gamePhase === 'avoid'"> Collect 200 energy</div> 
        <div v-if="gamePhase === 'kill'"> {{ killCount }}/{{killTarget}} </div> 
        <div :style="{'--value':energy / 200}" class="bar right">energy {{ energy }}</div>
    </section>
    <section class="song-status bg-green-900 fixed z-50 bottom-0 left-0 right-0 flex">
        JSONg:
         {{jsong.current?.name}}
         {{jsong?.state}}
         <button @click="scene('shoot')">Shoot</button>
         <button @click="scene('avoid')">Avoid</button>
         <button @click="scene('boss')">Boss</button>
         <button @click="next()">Next</button>
    </section>
</template>

<style scoped>
.phaser-container{
    display: grid;
    grid-template-areas: "abs";
    place-items: center;
}

.phaser-container > * {
    grid-area: abs;
}

.bar{
    position: relative;
}
.bar.right::before {
    right: 0;
}
.bar::before {
    position: absolute;
    z-index: -1;
    content: '';
    width: calc(50vw * var(--value));
    height: 100%;
    background-color: hsl(calc(90deg * var(--value)) 60% 40%);
}


.vignette {
    width: 100vmin;
    height: 100vmin;
    z-index: 40;
    box-shadow: 0 0 500px black inset, 0 0 50px black inset, 0 0 50px black inset;
}

.canvas.transition {
    transition: filter 3s;
}
.canvas.fade{
    filter: brightness(0);
    transition: filter 3s;
}

</style>