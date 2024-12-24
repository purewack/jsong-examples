<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { EventBus } from './events';
import StartGame from './main';

const props = defineProps({width: Number, height: Number})

// Save the current scene instance
const scene = ref();
const game = ref();

const emit = defineEmits(['current-active-scene']);

onMounted(() => {

    game.value = StartGame('game-container');

    EventBus.on('current-scene-ready', (currentScene) => {
        scene.value = currentScene;
    });
});

onUnmounted(() => {

    if (game.value)
    {
        game.value.destroy(true);
        game.value = null;
        EventBus.removeListener('current-scene-ready')
        EventBus.removeListener('change-scene')
    }
    
});

defineExpose({ scene, game });
</script>

<template>
    <div id="game-container" :style="{'--ww':width, '--hh':height}"></div>
</template>

<style>
#game-container { 
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    height: calc(min(var(--ww),var(--hh)) * 1px);
    width: calc(min(var(--ww),var(--hh)) * 1px);
}
#game-container > canvas{ 
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
}
</style>