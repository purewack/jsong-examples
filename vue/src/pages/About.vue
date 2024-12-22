<template>
<main class="about p-8 max-w-[70ch] mx-auto">
    <h1 class="text-5xl font-dot">What is this?</h1>
    <p>This simple game illustrates transitions between music sections using JSONg audio.</p>
    <p>
        The game has 3 phases. Each phase has its own music theme. 
        Each theme transitions in and out without disturbig the flow of music.
        There are should be no abrupt changes that would ruin the song.
    </p>    
    <p>
        The game depends on the music also, in order to know when to switch sections.
    </p>

    <h1 class="text-5xl font-dot">How is it done?</h1>
    <p>
    The song is divided into 3 main chunks. In the manifest file there are more than 3 logical sections
    however, there are transitional sections with fade settings to smooth the overall transition.
    </p>

    <div class="flex items-center mx-auto w-max">
        <code>
            <pre>
"flow":[
    "idle-X",
    [
        "avoid",
        "avoid2-X",
        "avoid2_end->",
        "shoot-X",
        "shoot_end->",
        "boss"
    ]
]</pre>
        </code> 
        <i class="text-xs max-w-48 m-8">Actual manifest content might have changed in between the time of writing and publishing</i>

    </div>

    <h2 class="font-dot text-3xl">Phase 1</h2> 
    <p>In this phase you have to avoid asteroids with your rocket and rack up 200 energy points.</p>

    <h2 class="font-dot text-3xl">Phase 2</h2> 
    <p>In this phase you have to shoot down a number of aliens.</p>

    <h2 class="font-dot text-3xl">Phase 3</h2> 
    <p>In this phase you have to defeat the boss alien.</p>

    <h1 class="text-5xl font-dot">Phase to Phase</h1>
    <ul class="list-outside list-disc ml-4">
        <li><code>idle</code> is used in the menus.</li>
        <li><code>avoid</code> is used for the first half of Phase 1 until 100 energy</li>
        <li><code>avoid2</code> is used for the second half of Phase 1 until 200 energy</li>
        <li><code>avoid2_end</code> is used to change to Phase 2 after 200 energy</li>
        <li><code>shoot</code> is used until aliens are shot down</li>
        <li><code>shoot_end</code> is used to transition to Phase 3</li>
        <li><code>boss</code> plays throughout the boss fight and only queues a change after boss is exploded back to Phase 1</li>
    </ul>  
</main>
</template>

<style scoped>
.about p{
    margin-block: 2rem;
}
.about h1,h2{
    margin-top: 3rem;
    margin-bottom: 1rem;
}

.about code {
    @apply bg-gray-900 text-gray-200 rounded-sm font-mono text-xl;
}

.about code pre{
    @apply m-4
}
</style>