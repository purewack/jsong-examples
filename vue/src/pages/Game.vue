<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, watch } from 'vue';
import JSONg from 'jsong-audio';
import Phaser from 'phaser';
import { usePointer } from '@vueuse/core';

const jsong = inject('jsong') as JSONg
const canvas = ref()
const canvasClass = ref('')

const health = ref(100)
const fuel = ref(100)
const result = ref('')
const killCount = ref(0)
const killTarget = ref(50)
const phase = ref('avoid')

const {x,y} = usePointer()

class PlayerControlScene extends Phaser.Scene {
    cursors;
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;;
    portal;    
    explosion: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    down;
    allowFire = false;
    playerLasers: Phaser.Physics.Arcade.Group;
    fireTimer;

    preload(){
        this.load.spritesheet('player',
            "rocket.png",
            { frameWidth: 16, frameHeight: 32}
        );

        this.load.spritesheet('explode',
            "explode.png",
            { frameWidth: 72, frameHeight: 72}
        );

        this.load.image('bullet0','bullet0.png')
        this.load.image('bullet1','bullet1.png')
        this.load.image('bullet2','bullet2.png')
    }

    create(){ 
        this.portal = this.physics.add.sprite(128,128,'wormhole')
        this.portal.visible = false;

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

        this.explosion = this.physics.add.sprite(128, 128, 'explode')
        this.anims.create({
            key: 'player-explode',
            frames: this.anims.generateFrameNumbers('explode', { start: 0, end: 2 }),
            frameRate: 2,
            yoyo: true,
            hideOnComplete: true
        });
        this.explosion.visible = false;

        this.playerLasers = this.physics.add.group()
    }

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
        
        if(!this.input.activePointer.buttons){
            this.down = false;
            this.fireTimer?.destroy()
        }
        if(this.input.activePointer.buttons && !this.down && this.allowFire){
            this.down = true;
            console.log("shoot")
            this.fireTimer =  this.time.addEvent({
                delay: (1000 * 60 / 160),
                repeat: -1,
                callback: ()=>{
                    if(fuel.value <= 30) return
                    if(this.cursors.shift.isDown)
                        this.fireBurst()
                    else
                        this.fireBullet()
                }
            })
        }
    }


    fireBullet(){
        fuel.value -= 3;
        const rect = canvas.value.getBoundingClientRect()
        const xx = (x.value - rect.left) * 256 / rect.width
        const yy = (y.value - rect.top)  * 256 / rect.width
        const r = this.playerLasers.create(this.player.x, this.player.y,'bullet1')
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, xx, yy); 
        this.physics.velocityFromRotation(angle, 70, r.body.velocity)
        r.setAngularVelocity(-70 + Math.random() * 200)
    }

    fireBurst(){
        fuel.value -= 15;
        const rect = canvas.value.getBoundingClientRect()
        const xx = (x.value - rect.left) * 256 / rect.width
        const yy = (y.value - rect.top)  * 256 / rect.width

        const r = this.playerLasers.createMultiple({
            key: 'bullet0',
            setXY: { x: this.player.x, y: this.player.y },
            repeat: 6,
        })
        const offset = Math.random() * Math.PI
        r.forEach((c,i) => {
            c.angle = (i/(r.length-1 )) * Math.PI*2 + offset
            this.physics.velocityFromRotation(c.angle, 50, c.body.velocity)
        })
    }

    animateSpawn(){
        this.portal.setAngularVelocity(100)
        this.portal.setScale(0,0)
        this.player.setScale(0,0)
        this.portal.visible = true;
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

    animateFlyin(){
        this.player.setCollideWorldBounds(false)
        this.player.x = 128;
        this.player.y = 256+32;
        const t = this.tweens.add({
            targets: this.player,
            y: '-=75',
            duration: 1500,
            ease: 'Sine.inOut',
        }); 
        this.time.addEvent({
            delay: 1500,
            callback: ()=>{
                this.player.setCollideWorldBounds(true)
                console.log("ok")
            }
        })
    }
    

    animateDespawn(){
        this.player.setAcceleration(0,0)
        this.player.setVelocity(0,0)
        this.portal.x = this.player.x
        this.portal.y = this.player.y
        this.portal.setAngularVelocity(100)
        this.portal.setScale(0,0)
        this.portal.visible = true;
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
        this.fireTimer?.destroy()
    }
    animateExplode(){ 
        this.player.destroy()
        this.explosion.visible = true;
        this.explosion.x = this.player.x
        this.explosion.y = this.player.y
        this.explosion.setScale(0,0)
        this.tweens.add({
            targets: this.explosion,
            scale: '+=1',
            duration: 1000,
            ease: 'Sine.inOut',
            yoyo: true,
        }); 
        this.explosion.anims.play('player-explode');
        this.fireTimer?.destroy()
    }

}

class AvoidPhase extends PlayerControlScene {
    
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    portal: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    powers;

    obstacles;

    deductor;
    

    preload ()
    {   
        super.preload()

        this.load.image('power',"power0.png")

        this.load.image('obstacle0',"obs0.png")
        this.load.image('obstacle1',"obs1.png")

        this.load.image('wormhole',"wormhole.png")
    }
    create ()
    {    
        super.create()
        this.input.mouse.disableContextMenu();
        this.cursors = this.input.keyboard.createCursorKeys();
        
        const wallL = this.physics.add.staticBody(-1,-1000,1,2000)
        const wallR = this.physics.add.staticBody(256,-1000,1,2000)

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

        fuel.value = 50
        health.value = 100
        this.deductor =  this.time.addEvent({
            delay: (1000 * 60 / 160 * 2),
            repeat: -1,
            callback: ()=>{
                if(fuel.value)
                fuel.value -= 1;
            }
        })

        this.animateFlyin()
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
        item.destroy()
        fuel.value += 15
        this.time.addEvent({
            delay: 2000,
            callback: ()=>{
                this.randomPower()
            }
        });
    }

    playerCollideRock(player, item){
        console.warn(item)
        health.value -= 15
    }

    update(){

        if(result.value === '' ){
            if(fuel.value > 0)
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
                health.value = 0
                result.value = 'lost'
                this.animateExplode()
            }
            if(fuel.value >= 60) {
                result.value = 'win'
                this.animateDespawn()
                changePhase('kill')
            }
        }

    }
}


class AttackPhase extends PlayerControlScene {
    
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    portal: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    powers;

    enemies;
    enemyLasers;

    deductor;

    preload ()
    {   
        super.preload()

        this.load.image('power',"power0.png")

        this.load.image('enemy0',"enemy1.png")

        this.load.image('wormhole',"wormhole.png")
    }
    create ()
    {
        super.create()
        this.allowFire = true;
        // this.input.mouse.disableContextMenu();
        this.cursors = this.input.keyboard.createCursorKeys();

        const wallL = this.physics.add.staticBody(-1,-1000,1,2000)
        const wallR = this.physics.add.staticBody(256,-1000,1,2000)
        
   
        this.powers = this.physics.add.group()
        this.enemies = this.physics.add.group()

        this.enemyLasers = this.physics.add.group()

        this.physics.add.overlap(this.player, this.enemyLasers, this.playerHit, null, this);
        
        this.physics.add.overlap(this.enemies, this.playerLasers, this.enemyHit, null, this);

        this.physics.add.overlap(this.player, this.powers, this.collectPower, null, this);

        this.physics.add.collider(this.enemies, wallL)
        this.physics.add.collider(this.enemies, wallR)

        this.physics.add.collider(this.powers, wallL)
        this.physics.add.collider(this.powers, wallR)

        this.physics.add.collider(this.player, this.enemies, this.playerCollideRock)

        for(let i=2; i<9+2; i++){
            this.time.addEvent({
                delay: 700 * i,
                callback: ()=>{
                    this.randomEnemy()
                }
            });
        }

        this.time.addEvent({
            delay: 4000,
            repeat: -1,
            callback: ()=>{
                const enemies =  this.enemies.getChildren()
                const ii = Math.floor(Math.random() * (enemies.length-1))
                const enemy = enemies[ii] 
                if(!enemy) return
                const r = this.enemyLasers.create(enemy.x, enemy.y,'bullet2')
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y); 
                this.physics.velocityFromRotation(angle, 50, r.body.velocity)
                r.setAngularVelocity(-70 + Math.random() * 200)
               
            }
        })

        // for(let i=2; i<5+2; i++){
        //     this.time.addEvent({
        //         delay: 1000 * (i+2),
        //         callback: ()=>{
        //             this.randomPower()
        //         }
        //     });
        // }

        fuel.value = 200
        health.value = 100
        
        this.animateSpawn()

        this.time.addEvent({
            delay: 15000,
            repeat: -1,
            callback: ()=>{
                this.randomPower()
            }
        })
    }


    randomPower(){
        const r = this.powers.create(256*Math.random(),-32,'power')
        r.setCircle(8)
        r.setBounce(1,1)
        r.setVelocityY(10 + 20*Math.random())
        r.setVelocityX((10*Math.random()) - 5)
        r.setAngularVelocity(-70 + Math.random() * 200)
    }
    randomEnemy(){
        const rnd = Math.random() > 0.2
        const type = {
            name: rnd ? 'enemy0' : 'enemy0',
            size: rnd ? 12 : 12
        }
        const edge = Math.floor(Math.random() * 4)
        let r

        const maxSpeed = 10 + 100 * Math.min(killCount.value / killTarget.value,100)
        const speed = (maxSpeed/2) + maxSpeed*Math.random()
        const angle = (40*Math.random()) - 20

        switch(edge){
            default: 
                r = this.enemies.create(256*Math.random(),-32,type.name)
                r.setVelocityY(speed)
                r.setVelocityX(angle)
            break;
            case 1: 
                r = this.enemies.create(256*Math.random(),256+32,type.name)
                r.setVelocityY(-speed)
                r.setVelocityX(angle)
            break;
        }
       
        // r.setCircle(type.size)
        r.setBounce(1,1)
        // r.setCollideWorldBounds(true)
        // r.setAngularVelocity(-70 + Math.random() * 200)
    }

    collectPower(player, item){
        item.destroy()
        fuel.value += 15
        this.time.addEvent({
            delay: 2000,
            callback: ()=>{
                this.randomPower()
            }
        });
    }

    playerHit(player, bullet){
        bullet.destroy()
        health.value -= 10
    }
    enemyHit(enemy, bullet){
        bullet.destroy()
        enemy.destroy()
        if(!result.value){
            killCount.value += 1;
            this.randomEnemy()
        }
    }

    playerCollideRock(player, item){
        console.warn(item)
        health.value -= 15
    }

    update(){
        if(result.value === '' ){
            if(fuel.value > 0)
                this.playerControlUpdate()

            this.powers.getChildren().forEach(element => {
                if(element.y > 300){
                    element.destroy()
                    this.randomPower()
                }
            })

            this.enemies.getChildren().forEach(element => {
                if((element.body.x < -64 ) || (element.body.x > 256+64 )
                || (element.body.y < -64 ) || (element.body.y > 256+64))
                {
                    element.destroy()

                    this.time.addEvent({
                        delay: 1000 + 1000*Math.random(),
                        callback: ()=>{
                            this.randomEnemy()
                        }
                    });
                }
            });

            if(health.value <= 0) {
                health.value = 0
                result.value = 'lost'
                this.animateExplode()
            }
            if(health.value >= 200) {
                result.value = 'win'
                this.animateDespawn()
            }
        }


        this.playerLasers.getChildren().forEach(element => {
            if((element.body.x < -64 ) || (element.body.x > 256+64 )
            || (element.body.y < -64 ) || (element.body.y > 256+64))
            {
                element.destroy()
            }
        });

        this.enemyLasers.getChildren().forEach(element => {
            if((element.body.x < -64 ) || (element.body.x > 256+64 )
            || (element.body.y < -64 ) || (element.body.y > 256+64))
            {
                element.destroy()
            }
        });

    }
}


const game = ref<Phaser.Game>()
function changePhase(phase: string){
    canvasClass.value = 'fade'
        setTimeout(()=>{
            game.value.scene.start(phase)
        },4000)
    }

onMounted(async ()=>{
    jsong.addEventListener('change',(ev)=>{

    })
    game.value = new Phaser.Game({
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
        transparent: true,
        scene: AvoidPhase
    });
    canvas.value.style = 'width: 100vmin; height: 100vmin; image-rendering: pixelated;'
})

onUnmounted(()=>{
    game.value.destroy(false)
})

</script>

<template>
    <main class="w-full h-full game-container">
        <canvas id="game" ref="canvas" class="canvas" :class="canvasClass">
        </canvas>
        <div class="vignette"></div>
    </main>
    <section class="fixed z-50 top-0 left-0 right-0 flex justify-between">
        <div :style="{'--value':health / 100}" class="bar">Health {{ health }}</div>
        <div v-if="phase === 'avoid'"> Collect 200 fuel</div> 
        <div v-if="phase === 'kill'"> {{ killCount }}/{{killTarget}} </div> 
        <div :style="{'--value':fuel / 200}" class="bar right">Fuel {{ fuel }}</div>
    </section>
    <section class="song-status bg-green-900 fixed z-50 bottom-0 left-0 right-0 flex">
        JSONg: {{ jsong.manifest?.meta }} {{x}}:{{y}}
    </section>
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
  /* box-shadow: 0 0 500px black inset, 0 0 50px black inset, 0 0 50px black inset; */
}

.canvas.fade{
    animation: fadeout 3s 3s forwards;
}

@keyframes fadeout {
    50% {
        filter: brightness(0);
    }
}

</style>