<script setup lang="ts">
import { inject, onMounted, onUnmounted, reactive, ref, toRaw, watch } from 'vue';
import JSONg from 'jsong-audio';
import { ChangeEvent, QueueEvent, StateEvent } from 'jsong-audio/dist/types/events';
import Phaser from '@/game/Phaser.vue';
import { EventBus } from '@/game/events';
import { useRoute, useRouter } from 'vue-router';

const jsong = inject('jsong') as JSONg
const phaserRef = ref()
const health = ref(100)
const energy = ref(100)
const killCount = ref(0)
const killTarget = ref(60)
const gamePhase = ref('avoid')
const playerInfo = reactive({
    state: '',
    section: '',
    queued: '',
})

const router = useRouter()

const queuedScene = ref('')
function scene(to){
    queuedScene.value = to
    EventBus.emit('end-scene')
}
onMounted(()=>{
    health.value = 100
    energy.value = 50
    gamePhase.value = 'avoid'
})

EventBus.addListener('player-hit',()=>{
    if(health.value - 5 <= 0){
        health.value = 0
        EventBus.emit('player-dead')
        jsong.cancel()
        setTimeout(()=>{
            router.push('/')
            gamePhase.value = 'over'
        },2000)
    }
    else 
        health.value -= 5
})
EventBus.addListener('enemy-hit',()=>{

    if(gamePhase.value === 'shoot'){
        killCount.value += 1;
        if(killCount.value >= killTarget.value){
            const progressTo = jsong.getPosition().section[0] / jsong.getPosition().section[1]
            if(progressTo <= 0.72) {
                //quickly swap out ending if section is before ending block
                jsong.overrideCurrent([2,4])
            }
            else 
                jsong.continue()
            gamePhase.value = ''
            scene('boss')
        }
        return
    }

    if(gamePhase.value === 'boss') {
        if(energy.value - 1 <= 0){
            energy.value = 0
            EventBus.emit('boss-dead')
            const progressTo = jsong.getPosition().section[0] / jsong.getPosition().section[1]
            if(progressTo > 0.5)
                //boss killed near end of section, play countdown section
                jsong.continue()
            else
                //boss killed quickly so can skip countdown
                jsong.continue([2,0])
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
        if(energy.value + 15 >= 100 && energy.value < 100 && jsong.current.name === 'avoid')
            jsong.continue()
        else if(energy.value +15 >= 200 && jsong.current.name === 'avoid2'){
            const progressTo = jsong.getPosition().section[0] / jsong.getPosition().section[1]
            if(progressTo <= 0.5) {
                jsong.overrideCurrent([2,2],0.3)
                console.log("queue pre avoid2 prog")
            }
            // else jsong.afterSectionPercentage(1-progressTo + 0.1).then(()=>{
            else{
                jsong.continue()
                console.log("queue post avoid2 prog")
            // })
            }

            scene('shoot')
        }
    energy.value += 15
})
EventBus.addListener('current-scene-end',()=>{
    const scene = toRaw(phaserRef.value.scene)
    scene.changeScene(queuedScene.value)
})
EventBus.addListener('current-scene-ready',(s)=>{
    console.log('ready scene',s)
    gamePhase.value = s.scene.key
    health.value = 100
    if(gamePhase.value === 'boss') energy.value = 250
    if(gamePhase.value === 'avoid') energy.value = 50
    if(gamePhase.value === 'shoot') energy.value = 150
    killCount.value = 0;
})
onUnmounted(()=>{
    EventBus.removeAllListeners()
})

const onQueue = (ev: QueueEvent)=>{
    console.log("queue",ev.to, ev.from)
    const timeTo = ev.timeUntil * 1000
    if(ev?.to?.name === 'avoid2_end') gamePhase.value = ''
    if(ev?.to?.name === 'shoot_end') gamePhase.value = ''

    if(ev?.to?.name === 'shoot_end') scene('boss')
    // else if(ev?.to?.name === 'avoid2_end') scene('shoot')
    else if(ev.to?.name === 'avoid' && ev.from?.name !== 'idle') scene('avoid')

    playerInfo.queued = ev?.to.name
}
const onChange = (ev: ChangeEvent)=>{
    console.log("change",ev.to, ev.from)
    playerInfo.section = ev?.to.name
    playerInfo.queued = ''
}
const onState = (ev: StateEvent)=>{
    playerInfo.state = ev.stateNow
}

onMounted(()=>{
    jsong.addEventListener('queue',onQueue)
    jsong.addEventListener('change',onchange)
    jsong.addEventListener('state',onState)
})
onUnmounted(()=>{
    jsong.removeEventListener('queue',onQueue)
    jsong.removeEventListener('change',onChange)
    jsong.removeEventListener('state',onState)
})


</script>

<template>
    <template v-if="gamePhase !== 'over'">
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
        <section class="fixed z-50 bottom-0 left-0 right-0 bg-blue-600 text-white"><p>JSONg: [{{ playerInfo.state }}] {{ playerInfo.section }} {{ playerInfo.queued ? `> ${playerInfo.queued}` : '' }}</p></section>
    </template>
    <template v-else>
        <h1>Game Over</h1>
        <h2>going back to title screen...</h2>
    </template>
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