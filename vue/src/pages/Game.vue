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
const killTarget = ref(35)
const gamePhase = ref('avoid')

EventBus.addListener('player-hit',()=>{
    // if(health.value - 10 <= 0){
    //     health.value = 0
    //     EventBus.emit('player-dead')
    // }
    // else 
    //     health.value -= 10
})
EventBus.addListener('enemy-hit',()=>{

    if(gamePhase.value === 'shoot'){
        killCount.value += 1;
        if(killCount.value >= killTarget.value){
            const progressTo = jsong.getPosition().section[0] / jsong.getPosition().section[1]
            if(progressTo <= 0.4) {
                jsong.continue()
                console.log("queue pre avoid2 prog")
            }
            else jsong.afterSectionPercentage(1-progressTo + 0.01).then(()=>{
                jsong.continue()
                console.log("queue post shoot prog")
            })
        }
        return
    }

    if(gamePhase.value === 'boss') {
        if(energy.value - 1 <= 0){
            energy.value = 0
            EventBus.emit('boss-dead')
            jsong.continue()
        }
        else 
            energy.value -= 1
    }
})

EventBus.addListener('player-fire-bullet',()=>{
    energy.value -= 1
})
EventBus.addListener('player-fire-burst',()=>{
    energy.value -= 10
})

EventBus.addListener('player-collect-power',()=>{
    if(gamePhase.value === 'avoid')
        if(energy.value + 15 >= 125 && energy.value < 125 && jsong.current.name === 'avoid')
            jsong.continue()
        else if(energy.value +15 >= 200 && jsong.current.name === 'avoid2'){
            const progressTo = jsong.getPosition().section[0] / jsong.getPosition().section[1]
            if(progressTo <= 0.4) {
                jsong.continue()
                console.log("queue pre avoid2 prog")
            }
            else jsong.afterSectionPercentage(1-progressTo + 0.1).then(()=>{
                jsong.continue()
                console.log("queue post avoid2 prog")
            })
        }
    energy.value += 8
})

jsong.addEventListener('queue',(ev: QueueEvent)=>{
    console.log("queue",ev.to, ev.from)
    const timeTo = ev.timeUntil * 1000
    if(ev?.to?.name === 'avoid2_end') gamePhase.value = ''
    if(ev?.to?.name === 'shoot_end') gamePhase.value = ''

    if(ev?.to?.name === 'shoot_end') scene('boss')
    if(ev?.to?.name === 'avoid2_end') scene('shoot')
    if(ev.to?.name === 'avoid' && ev.from?.name !== 'idle') scene('avoid')
})
jsong.addEventListener('change',(ev: ChangeEvent)=>{
    console.log("change",ev.to, ev.from)
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
    health.value = 100
    if(gamePhase.value === 'boss') energy.value = 250
    if(gamePhase.value === 'avoid') energy.value = 50
    if(gamePhase.value === 'shoot') energy.value = 150
    killCount.value = 0;
})

gamePhase.value = 'avoid'
</script>

<template>
    <main class="w-full h-full phaser-container">
        <Phaser ref="phaserRef"/>
        <!-- <div class="vignette"></div> -->
    </main>
    <section class="fixed z-50 top-0 left-0 right-0 flex justify-between">
        <div :style="{'--value':health / 100}" class="bar">Health {{ health }}</div>
        <div v-if="gamePhase === 'avoid'"> Collect 200 energy</div> 
        <div v-if="gamePhase === 'shoot'"> Shoot Aliens: {{ killCount }}/{{killTarget}} </div> 
        <div v-if="gamePhase === 'boss'"> Defeat Alien Boss </div> 
        <div v-if="gamePhase === 'boss'" :style="{'--value':energy / 100}" class="bar right">Boss {{ energy }}</div>
        <div v-else :style="{'--value':energy / 200}" class="bar right">Energy {{ energy }}</div>
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