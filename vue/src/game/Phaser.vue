<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { EventBus } from './events';
import StartGame from './main';

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
    <div id="game-container" ></div>
</template>

<style>
#game-container > canvas{
  width: 100vmin;
  height: 100vmin;
  image-rendering: pixelated;
}
</style>