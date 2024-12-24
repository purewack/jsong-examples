<script setup lang="ts">
import { inject, onMounted, onUnmounted, reactive, ref, toRaw, watch } from 'vue';
import JSONg from 'jsong-audio';
import { ChangeEvent, QueueEvent, StateEvent, TransportEvent } from 'jsong-audio/dist/types/events';
import Phaser from '@/game/Phaser.vue';
import { EventBus } from '@/game/events';
import { useRouter } from 'vue-router';
import { UseElementSize } from '@vueuse/components';
import { useTimeout } from '@vueuse/core';

const jsong = inject('jsong') as JSONg
const phaserRef = ref()
const healthTimeout = useTimeout(250, { controls: true })
const noDamage = ref(false)
const health = ref(100)
const energy = ref(100)
const killCount = ref(0)
const killTarget = ref(60)
const gamePhase = ref('loading')
const playerInfo = reactive({
    state: '',
    stateColor: 'text-green-200',
    section: '',
    queued: '',
    index: [],
    deltaTime: 0,
    click: 0,
    sectionLen:0
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
    healthTimeout.stop()
})



const onQueue = (ev: QueueEvent)=>{
    const timeTo = ev.timeUntil * 1000
    console.log("queue",ev.to, ev.from, timeTo)
    if(ev?.to?.name === 'avoid2_end') gamePhase.value = ''
    if(ev?.to?.name === 'shoot_end') gamePhase.value = ''

    if(ev?.to?.name === 'shoot_end') scene('boss')
    else if(ev.to?.name === 'avoid' && ev.from?.name !== 'idle') scene('avoid')

    playerInfo.queued = ev?.to.name
}
const onChange = (ev: ChangeEvent)=>{
    console.log("change",ev.to, ev.from)
    playerInfo.queued = ''
    playerInfo.section = ev.to.name
    playerInfo.index = ev.to.index
}
const onState = (ev: StateEvent)=>{
    playerInfo.state = ev.stateNow
    if(playerInfo.state === 'playing') playerInfo.stateColor = 'text-green-200'; 
    if(playerInfo.state === 'continue') playerInfo.stateColor =  'text-yellow-200'; 
    if(playerInfo.state === 'queue') playerInfo.stateColor = 'text-orange-200';
    if(playerInfo.state === 'transition')playerInfo.stateColor = 'text-purple-200'
}
const onTime = (ev: TransportEvent)=>{
    playerInfo.deltaTime = ev.countdown || 0
    playerInfo.click = ev.progress[0]
    playerInfo.sectionLen = ev.progress[1]
}

jsong.addEventListener('queue',onQueue)
jsong.addEventListener('change',onChange)
jsong.addEventListener('state',onState)
jsong.addEventListener('transport',onTime)
playerInfo.state = jsong.state
playerInfo.section = jsong.current.name
playerInfo.index = jsong.current.index
onUnmounted(()=>{
    jsong.removeEventListener('queue',onQueue)
    jsong.removeEventListener('change',onChange)
    jsong.removeEventListener('state',onState)
    jsong.removeEventListener('transport',onTime)
})



EventBus.addListener('player-hit',()=>{
    if(noDamage.value) return
    if(healthTimeout.isPending.value) return
    healthTimeout.start()
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
            if(progressTo <= 0.75) {
                //quickly swap out ending if section is before ending block
                jsong.overrideCurrent([2,4])
            }
            else 
                jsong.continue([2,5])
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
    if(gamePhase.value !== 'avoid') return
    
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
            jsong.continue([2,3])
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

</script>

<template>
    <template v-if="gamePhase !== 'over'">
    <main class="w-full h-screen game-container">
        <UseElementSize v-if="gamePhase !== 'loading'" v-slot="{ width, height }" class="relative">
            <Phaser ref="phaserRef" :width="width" :height="height"/>
        </UseElementSize>
        <section class="hud-container z-50 flex justify-between">
            <div :style="{'--value':health / 100}" class="bar">Health {{ health }}</div>
            <div v-if="gamePhase === 'avoid'"> Collect 200 energy</div> 
            <div v-if="gamePhase === 'shoot'"> Shoot Aliens: {{ killCount }}/{{killTarget}} </div> 
            <div v-if="gamePhase === 'boss'"> Defeat Alien Boss </div> 
            <div v-if="gamePhase === 'boss'" :style="{'--value':energy / 100}" class="bar right">Boss {{ energy }}</div>
            <div v-else :style="{'--value':energy / 200}" class="bar right">Energy {{ energy }}</div>
        </section>
        <section class="stat-container bg-gray-800 border p-1 text-white m-4 w-[20ch] text-xs">
            <pre class="font-main">
JSONg Info 

State  : <span :class="playerInfo.stateColor">{{ playerInfo.state }}</span>
Index  : <span class="text-nowrap whitespace-nowrap">{{ playerInfo.index }}</span>
Current: <span class="text-yellow-200">{{ playerInfo.section }}</span>
Queued : <span class="text-orange-200">{{ playerInfo.queued }}</span> 

Countdown: 
    {{playerInfo.deltaTime}} beats
    {{(playerInfo.deltaTime * jsong.timingInfo.beatDuration).toFixed(1)}}s
            </pre>
            <p class="text-center">{{ playerInfo.click }}/{{ playerInfo.sectionLen }}</p>
            <ul class="flex flex-row w-min mx-auto">
               <li v-for="(b,i) in playerInfo.sectionLen" class="" :class="i >= playerInfo.click ? (playerInfo.click >= 12 ? 'bg-red-400' : 'bg-blue-400') : 'bg-green-500'">
                .
               </li> 
            </ul>
            <button class="bg-gray-700" @click="noDamage = !noDamage">
                Infinite Health: {{ noDamage ? '[X]' : '[ ]'}}
            </button>
            <h1 class="text-green-300 text-sm my-4">Phase: {{ gamePhase }}</h1>
            <p v-if="gamePhase === 'avoid' && jsong.current.name === 'avoid'" >
                When you collect 100+ energy, music will change.</br>
                Use the arrow keys to move.
            </p>
            <p v-else-if="gamePhase === 'avoid'">
                You now need to collect the full 200 energy to progress.
                <br/>
                <br/>
                <br/>
                If you collect the last energy <span class="text-yellow-200">before the 50%</span> mark of the section
                the current section will be hot-swapped for the same one but with an ending bar 
                in the last 4 beats.
                <br/>
                <br/>
                Otherwise the next section will be queued and will commence in the next 4 beats.
            </p>
            <p v-else-if="gamePhase === 'shoot'">
                You now need to shoot down {{ killTarget }} aliens.</br>
                Mash the space-bar to shoot.
                <br/>
                <br/>
                <br/>
                If you land the last hit <span class="text-yellow-200">after the 75% (12/16 beats)</span>, there will be no transitional section,
                else if you are before the 3/4 mark, a transitional section will be hot-swapped again.
            </p>
            <p v-else-if="gamePhase === 'boss'">
                You now need to defeat the Boss.</br>
                Mash the space-bar to shoot and auto-target.
                <br/>
                <br/>
                <br/>
                If you land the last hit <span class="text-yellow-200">after the 50%</span>,
                there will be a transition to a longer countdown section that plays during the <i>avoid</i> phase
            </p>
        </section>
    </main>
    </template>
    <template v-else>
        <div class="flex flex-col items-center justify-center h-screen">
        <h1 class="text-4xl">Game Over</h1>
        <h2>going back to title screen...</h2>
        </div>
    </template>
</template>

<style scoped>

.game-container {
    display: grid;
    grid-template: 
        "hud hud" min-content
        "game stat" auto / auto min-content;
}

.hud-container {
    grid-area: hud;
    place-self: stretch;
}

.stat-container{ 
    grid-area: stat;
    place-self: stretch center;
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
    box-shadow: 0 0 200px black inset, 0 0 50px black inset, 0 0 50px black inset;
}

.canvas.transition {
    transition: filter 3s;
}
.canvas.fade{
    filter: brightness(0);
    transition: filter 3s;
}

</style>