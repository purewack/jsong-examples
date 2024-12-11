<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import JSONg from 'jsong-audio';
import Phaser from 'phaser';

const jsong = inject('jsong') as JSONg
const canvas = ref()
const canvasClass = ref('')

const health = ref(100)
const result = ref('')

class PlayerControlScene extends Phaser.Scene {
    cursors;
    player;

    playerControlUpdate(){
        if(this.cursors.up.isDown){ 
            this.player.setAccelerationY(-100);
        }
        else if(this.cursors.down.isDown){ 
            this.player.setAccelerationY(100);
        }
        else this.player.setAccelerationY(0);

        if(this.cursors.left.isDown){ 
            this.player.setAccelerationX(-100);
        }
        else if(this.cursors.right.isDown){ 
            this.player.setAccelerationX(100);
        }
        else 
        this.player.setAccelerationX(0);
        
        this.player.rotation = this.player.body.velocity.angle() + Math.PI/2

    }
}

class AvoidPhase extends PlayerControlScene {
    
    cursors;
    
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    portal: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    powers;

    obstacles;

    deductor;
    

    preload ()
    {   
        this.load.spritesheet('player',
            "rocket.png",
            { frameWidth: 16, frameHeight: 32}
        );

        this.load.image('power',"power0.png")

        this.load.image('obstacle0',"obs0.png")
        this.load.image('obstacle1',"obs1.png")

        this.load.image('wormhole',"wormhole.png")
    }
    create ()
    {
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.portal = this.physics.add.sprite(128,128,'wormhole')

        const wallL = this.physics.add.body(-1,-1000,1,1000)
        const wallR = this.physics.add.body(257,-1000,1,1000)
        
        this.player = this.physics.add.sprite(128, 128, 'player').setOrigin(0.5,0.25)
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.25,0.25)
        this.player.setCircle(8)
        this.player.setVelocityY(-1)

        this.anims.create({
            key: 'player-fly',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            frameRate: 2.666,
            repeat: -1,
        });
        this.player.anims.play('player-fly');

        this.powers = this.physics.add.group()
        this.obstacles = this.physics.add.group()

        this.physics.add.overlap(this.player, this.powers, this.collectPower, null, this);

        this.physics.add.collider(this.obstacles, this.obstacles)
        this.physics.add.collider(this.powers, this.obstacles)
        this.physics.add.collider(this.powers, wallL)
        this.physics.add.collider(this.powers, wallR)
        this.physics.add.collider(this.player, this.obstacles, this.playerCollideRock)

        for(let i=2; i<12+2; i++){
            this.time.addEvent({
                delay: 700 * i,
                callback: ()=>{
                    this.randomRock()
                }
            });
        }

        for(let i=2; i<5+2; i++){
            this.time.addEvent({
                delay: 1000 * (i+2),
                callback: ()=>{
                    this.randomPower()
                }
            });
        }

        health.value = 50
        this.deductor =  this.time.addEvent({
            delay: (1000 * 60 / 160 * 2),
            repeat: -1,
            callback: ()=>{
                health.value -= 1;
            }
        })
        this.animateSpawn()
    }

    animateSpawn(){
        this.portal.setAngularVelocity(100)
        this.portal.setScale(0,0)
        this.player.setScale(0,0)
        this.tweens.add({
            targets: this.portal,
            scale: '+=1',
            duration: 2000,
            ease: 'Sine.inOut',
            yoyo: true,
        }); 

        const t = this.tweens.add({
            targets: this.player,
            scale: '+=1',
            duration: 2000,
            ease: 'Sine.inOut',
        }); 
    }

    animateDespawn(){
        this.player.setAcceleration(0,0)
        this.player.setVelocity(0,0)
        this.portal.x = this.player.x
        this.portal.y = this.player.y
        this.portal.setAngularVelocity(100)
        this.portal.setScale(0,0)
        this.tweens.add({
            targets: this.portal,
            scale: '+=1',
            duration: 2000,
            ease: 'Sine.inOut',
            yoyo: true,
        }); 

        const t = this.tweens.add({
            targets: this.player,
            scale: '-=1',
            duration: 2000,
            ease: 'Sine.inOut',
        }); 
    }


    randomPower(){
        const r = this.powers.create(256*Math.random(),-32,'power')
        r.setCircle(8)
        r.setBounce(1,1)
        r.setVelocityY(10 + 20*Math.random())
        r.setVelocityX((10*Math.random()) - 5)
        r.setAngularVelocity(-70 + Math.random() * 200)
    }
    randomRock(){
        const rnd = Math.random() > 0.2
        const type = {
            name: rnd ? 'obstacle0' : 'obstacle1',
            size: rnd ? 12 : 24
        }
        const r = this.obstacles.create(256*Math.random(),-32,type.name)
        r.setCircle(type.size)
        r.setBounce(1,1)
        r.setVelocityY(30 + 20*Math.random())
        r.setVelocityX((10*Math.random()) - 5)
        r.setAngularVelocity(-70 + Math.random() * 200)
    }

    collectPower(player, item){
        console.log("power",item)
        item.destroy()
        health.value += 15
        this.time.addEvent({
            delay: 2000,
            callback: ()=>{
                this.randomPower()
            }
        });
    }

    playerCollideRock(player, item){
        console.warn(item)
        health.value -= 10
    }

    update(){
        if(result.value === ''){
            this.playerControlUpdate()

            this.powers.getChildren().forEach(element => {
                if(element.y > 300){
                    element.destroy()
                    this.randomPower()
                }
            })

            this.obstacles.getChildren().forEach(element => {
                if((element.body.x < -64 ) || (element.body.x > 256+64 )
                || (element.body.y < -64 ) || (element.body.y > 256+64))
                {
                    element.destroy()

                    this.time.addEvent({
                        delay: 1000 + 1000*Math.random(),
                        callback: ()=>{
                            this.randomRock()
                        }
                    });
                }
            });

            if(health.value <= 0) {
                result.value = 'lost'
                this.animateDespawn()
            }
            if(health.value >= 200) {
                result.value = 'win'
                this.animateDespawn()
            }
        }

    }
}

onMounted(async ()=>{
    jsong.addEventListener('change',(ev)=>{

    })
    const game = new Phaser.Game({
        type: Phaser.CANVAS,
        zoom: 3,
        width: 256,
        height: 256,
        canvas: canvas.value,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {x:0, y:0},
                debug: true
            }
        },
        pixelArt: true,
        backgroundColor:'#ffffff',
        // transparent: true,
        scene: AvoidPhase
    });
    canvas.value.style = 'width: 100vmin; height: 100vmin; image-rendering: pixelated;'
})

</script>

<template>
    <div class="w-full h-full game-container" >
        <canvas ref="canvas" :class="canvasClass">
        </canvas>
        <div class="vignette"></div>
    </div>
    <div class="fixed bottom-0 left-0">Health {{ health }} {{result}}</div>
</template>

<style scoped>
.game-container{
    display: grid;
    grid-template-areas: "abs";
    place-items: center;
}

.game-container > * {
    grid-area: abs;
}

.vignette {
    width: 100vmin;
    height: 100vmin;
    z-index: 100;
  box-shadow: 0 0 500px black inset, 0 0 50px black inset, 0 0 50px black inset;
}

.fade-out {
    animation: fadeout 2s forwards;
}

@keyframes fadeout {
    to {
        filter: brightness(0);
    }
}
</style>