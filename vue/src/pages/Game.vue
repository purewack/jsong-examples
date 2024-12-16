<script setup>
import { inject, onMounted, onUnmounted, ref, watch } from 'vue';
import JSONg from 'jsong-audio';
import Phaser from 'phaser';
import { usePointer } from '@vueuse/core';
import { ChangeEvent, QueueEvent } from 'jsong-audio/dist/types/events';

const jsong = inject('jsong')
const canvas = ref()
const canvasClass = ref('')

const health = ref(100)
const energy = ref(100)
const result = ref('')
const killCount = ref(0)
const killTarget = ref(20)
const gamePhase = ref('avoid')
const gamePhaseChange = ref(false)
const game = ref()


const {x,y} = usePointer()

class PlayerControlScene extends Phaser.Scene {
    cursors;
    player;
    portal;    
    explosion;
    down;
    allowFire = false;
    allowMove = false;
    playerLasers;
    fireTimer;
    timers = [];
    entities = [];

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
        this.portal = this.physics.add.sprite(128,-128,'wormhole')
        this.portal.visible = false;

        this.player = this.physics.add.sprite(128, -128, 'player').setOrigin(0.5,0.25)
        this.player.setCollideWorldBounds(false);
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

        this.explosion = this.physics.add.sprite(128, -128, 'explode')
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
        if(!this.player.active) return
        
        if(this.allowMove){
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
        }
        
        this.player.rotation = this.player.body.velocity.angle() + Math.PI/2
        
    }

    playerReset(){
        this.player.setScale(1)
        this.player.setGravity(0)
        this.player.setGravityY(0)
        this.player.setGravityX(0)
        this.player.setVelocity(0)
        this.player.setVelocityX(0)
        this.player.setVelocityY(0)
        this.player.setAcceleration(0)
        this.player.setAccelerationX(0)
        this.player.setAccelerationY(0)
        this.player.setAngularAcceleration(0)
        this.player.setAngularVelocity(0)
    }


    fireBullet(){
        energy.value -= 3;
        const rect = canvas.value.getBoundingClientRect()
        const xx = (x.value - rect.left) * 256 / rect.width
        const yy = (y.value - rect.top)  * 256 / rect.width
        const r = this.playerLasers.create(this.player.x, this.player.y,'bullet1')
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, xx, yy); 
        this.physics.velocityFromRotation(angle, 70, r.body.velocity)
        r.setAngularVelocity(-70 + Math.random() * 200)
        this.entities.push(r)
    }

    fireBurst(){
        energy.value -= 15;
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
        this.entities.push(...r)
    }

    animateSpawn(duration = 4000){
        return new Promise((res)=>{
        this.portal.visible = true
        this.portal.setPosition(128,128)
        this.portal.setAngularVelocity(100)
        this.portal.setScale(0)
        this.tweens.add({
            targets: this.portal,
            scale: '+=1',
            duration: duration/2,
            ease: 'Sine.inOut',
            yoyo: true,
        }); 

        this.playerReset()
        this.player.setPosition(128,128)
        this.player.setScale(0)
        const t = this.tweens.add({
            targets: this.player,
            scale: '+=1',
            duration: duration/2,
            ease: 'Sine.inOut',
        }); 
        const e = this.time.addEvent({
            delay: duration,
            callback: ()=>{
                res(true)
            }
        })
        this.timers.push(t,e)
        })
    }

    animateFlyin(duration = 1500){
        return new Promise((res)=>{
        this.playerReset()
        this.player.setCollideWorldBounds(false)
        this.player.x = 128;
        this.player.y = 256+32;
        const t = this.tweens.add({
            targets: this.player,
            y: '-=150',
            duration: duration/2,
            ease: 'Sine.inOut',
        }); 
        const r = this.time.addEvent({
            delay: duration,
            callback: ()=>{
                this.player.setCollideWorldBounds(true)
                res(true)
            }
        })
        this.timers.push(t,r)
        })
    }
    

    animateDespawn(duration = 4000){
        return new Promise((res)=>{
        this.allowMove = false
        this.portal.x = this.player.x
        this.portal.y = this.player.y
        this.portal.setAngularVelocity(100)
        this.portal.setScale(0)
        this.portal.visible = true;
        const p = this.tweens.add({
            targets: this.portal,
            scale: '+=1',
            duration: duration/2,
            ease: 'Sine.inOut',
            yoyo: true,
        }); 

        this.playerReset()
        const t  = this.tweens.add({
            targets: this.player,
            scale: '-=1',
            duration: duration/2,
            ease: 'Sine.inOut',
        }); 
        this.fireTimer?.destroy()
        const r = this.time.addEvent({
            delay: duration,
            callback: ()=>{
                res(true)
            }
        })

        this.timers.push(t,r,p)
        })
    }
    animateExplode(duration = 2000){ 
        return new Promise((res)=>{
        this.allowMove = false
        this.explosion.visible = true;
        this.explosion.x = this.player.x
        this.explosion.y = this.player.y
        this.explosion.setScale(0,0)
        this.tweens.add({
            targets: this.explosion,
            scale: '+=1',
            duration: duration/2,
            ease: 'Sine.inOut',
            yoyo: true,
        }); 
        this.explosion.anims.play('player-explode');
        this.fireTimer?.destroy()
        this.playerReset()
        this.player.visible = false;
        this.player.active = false; 
        this.time.addEvent({
            delay: duration,
            callback: ()=>{
                res(true)
            }
        })
        })
    }

}


class Game extends PlayerControlScene {

    cursors;
    
    player;

    portal;

    powers;

    boss;
    enemies;
    enemyLasers;

    obstacles;

    gameActive = true

    exclude = []

    constructor(){
        super({key:'game'})
    }

    preload ()
    {   
        super.preload()

        this.load.image('enemy0',"enemy0.png")
        this.load.image('enemy1',"enemy1.png")
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
   
        this.obstacles = this.physics.add.group()
        this.powers = this.physics.add.group()
        this.enemies = this.physics.add.group()
        this.enemyLasers = this.physics.add.group()
        this.boss = this.physics.add.image(128, -128, 'enemy1')


        this.physics.add.collider(this.enemies, wallL)
        this.physics.add.collider(this.enemies, wallR)
        this.physics.add.overlap(this.enemies, this.playerLasers, this.enemyHit, null, this);

        this.physics.add.collider(this.powers, wallL)
        this.physics.add.collider(this.powers, wallR)
        this.physics.add.collider(this.powers, this.obstacles)

        this.physics.add.collider(this.player, this.enemies, this.playerCollideRock)
        this.physics.add.collider(this.player, this.obstacles, this.playerCollideRock)
        this.physics.add.overlap(this.player, this.powers, this.collectPower, null, this);
        this.physics.add.overlap(this.player, this.enemyLasers, this.playerHit, null, this);
        this.physics.add.overlap(this.player, this.boss, this.playerCollideBoss, null, this);

        this.physics.add.collider(this.obstacles, this.obstacles)

        this.exclude.push(wallL, wallR, this.player, this.boss, this.portal, this.explosion)
        this.createCapture(2000)
    }

    
    createKill(){
        gamePhase.value = 'kill'
        this.reset()
        this.playerReset()
        this.player.setVelocityY(-1)
        this.player.setPosition(128,128)
        this.player.visible = true
        this.animateSpawn().then(()=>{
            this.player.setCollideWorldBounds(true)
            this.allowFire = true
            this.allowMove = true
            energy.value = 200
            health.value = 100
            const deductor = this.time.addEvent({
                delay: (1000 * 60 / 160 * 2),
                repeat: -1,
                callback: ()=>{
                    if(energy.value)
                    energy.value -= 1;
                }
            })
            this.timers.push(deductor)

            const fire = this.time.addEvent({
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
                    this.entities.push(r)
                }
            })
            this.timers.push(fire)

            for(let i=2; i<9+2; i++){
                const spawner = this.time.addEvent({
                    delay: 700 * i,
                    callback: ()=>{
                        this.randomEnemy()
                    }
                });
                this.timers.push(spawner)
            }
            this.randomPower()
            this.randomPower()

            const powerup= this.time.addEvent({
                delay: 15000,
                repeat: -1,
                callback: ()=>{
                    this.randomPower()
                }
            })
            this.timers.push(powerup)
        })
        

    }
    createAvoid(){
        gamePhase.value = 'avoid'
        this.reset()
        this.playerReset()
        this.player.setVelocityY(-0.01)
        this.player.setPosition(128,256+32)
        this.player.visible = true
        this.animateSpawn().then(()=>{
            this.player.setCollideWorldBounds(true)
            this.allowMove = true
            energy.value = 50
            health.value = 100
            const deductor =  this.time.addEvent({
                delay: (1000 * 60 / 160 * 2),
                repeat: -1,
                callback: ()=>{
                    if(energy.value)
                    energy.value -= 1;
                }
            })
            this.timers.push(deductor)
            
            for(let i=2; i<12+2; i++){
                const rock = this.time.addEvent({
                    delay: 700 * i,
                    callback: ()=>{
                        this.randomRock()
                    }
                });
                this.timers.push(rock)
            }

            for(let i=2; i<3+2; i++){
                const power = this.time.addEvent({
                    delay: 2000 * (i+2),
                    callback: ()=>{
                        this.randomPower()
                    }
                });
                this.timers.push(power)
            }
        })
        
    }
    createCapture(duration){
        gamePhase.value = 'capture'
        energy.value = 5;
        health.value = 5;
        this.reset()
        this.playerReset()
        this.boss.visible = true;
        this.boss.active = true
        this.player.visible = true
        this.player.active = false
        this.player.setVelocityY(-1)
        this.player.setPosition(128,300);
        this.boss.setPosition(128,-40);
        this.boss.setAngularVelocity(100);
        const t = this.tweens.add({
            targets: this.boss,
            y: '+=70',
            duration: duration/2,
            ease: 'Sine.inOut',
        }); 
        this.timers.push(t)

        this.animateFlyin(duration/2).then(()=>{
            this.player.setCollideWorldBounds(false)
            const grav = this.time.addEvent({
                delay: duration/2,
                callback: ()=>{
                    this.player.setGravityY(-10);
                    this.player.active = true; 
                }
            });
            this.timers.push(grav)
        })
    }

    timerReset(){
        this.timers.forEach((t)=>{
            t.remove()
            t.destroy()
        })
        this.timers = []
    }

    reset(){
        this.gameActive = true
        this.timerReset()
        this.entities.forEach((t)=>{
            console.warn("e",t)
            t.destroy()
        })
        this.entities = []
        const toRemove = this.children.list.filter(x => {
            console.log(x)
            return !this.exclude.includes(x) && x.type !== 'Graphics'
        }
        );

        console.log("toremove",toRemove)
        toRemove.forEach(o => {
            o.removeFromDisplayList()
            o.removeFromUpdateList()
            o.destroy()
        })
        this.player.visible = true;
        this.player.active = true;
        this.player.setAcceleration(0)
        this.player.setAngularAcceleration(0)
        this.player.setAngularVelocity(0)
        this.player.setGravity(0)
        this.player.rotation = 0
        this.player.setVelocity(0)
        this.player.setVelocityY(-1)
        this.boss.visible = false
        this.boss.active = false
        this.allowMove = false
        this.allowFire = false
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
        this.entities.push(r)
    }
    randomPower(){
        const r = this.powers.create(256*Math.random(),-32,'power')
        r.setCircle(8)
        r.setBounce(1,1)
        r.setVelocityY(10 + 20*Math.random())
        r.setVelocityX((10*Math.random()) - 5)
        r.setAngularVelocity(-70 + Math.random() * 200)
        this.entities.push(r)
    }
    randomEnemy(){
        const rnd = Math.random() > 0.2
        const type = {
            name: rnd ? 'enemy0' : 'enemy0',
            size: rnd ? 12 : 12
        }
        const edge = Math.floor(Math.random() * 4)
        let r

        const maxSpeed = 10 + 50 * Math.min(killCount.value / killTarget.value,100)
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
        this.entities.push(r)
    }

    collectPower(player, item){
        item.destroy()
        if(gamePhase.value === 'avoid' 
        && energy.value+20 >= 100
        && jsong.current?.name === 'avoid')
            jsong.continue()
        energy.value += 20
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
        health.value -= 15
    }

    playerCollideBoss(player, boss){
        if(!player.active) return
        if(!boss.active) return
        // this.animateExplode()
        health.value = 0;
        player.setGravity(0)
        player.setVelocity(0)
        player.setAcceleration(0)
        player.setAngularVelocity(0)
        player.setAngularAcceleration(150)
        player.setMaxVelocity(200)
        player.active = false
        const t = this.time.addEvent({
            delay: 5000,
            callback: ()=>{
                this.animateExplode()
            }
        })
        this.timers.push(t)
    }

    update(){

        if(result.value === '' ){
            if(energy.value > 0){
                this.playerControlUpdate()

                if(!this.input.activePointer.buttons){
                    this.down = false;
                    this.fireTimer?.destroy()
                }
                if(this.input.activePointer.buttons && !this.down){
                    this.down = true;
                    if(gamePhase.value === 'capture'){
                        console.log("rot",this.boss.rotation)
                        this.player.setAccelerationY(75)
                        const t = this.time.addEvent({
                            delay: 100,
                            callback: ()=>{
                                const r = this.boss.rotation
                                if(r < 0.25 && r > -1){
                                    this.player.setAccelerationY(-100)
                                }
                                else{
                                    this.player.setAccelerationY(-25)
                                }
                            }
                        })
                        return
                    }
                    else if(this.allowFire){
                    this.fireTimer =  this.time.addEvent({
                        delay: (1000 * 60 / 160),
                        repeat: -1,
                        callback: ()=>{
                            if(energy.value <= 30) return
                            if(this.cursors.shift.isDown)
                                this.fireBurst()
                            else
                                this.fireBullet()
                        }
                    })
                    }
                }
            }

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

        }

        

        this.playerLasers.getChildren().forEach(element => {
            if((element.x < -64 ) || (element.x > 256+64 )
            || (element.y < -64 ) || (element.y > 256+64))
            {
                element.destroy()
            }
        });

        this.enemyLasers.getChildren().forEach(element => {
            if((element.x < -64 ) || (element.x > 256+64 )
            || (element.y < -64 ) || (element.y > 256+64))
            {
                element.destroy()
            }
        });


        if(gamePhase.value === 'avoid' && this.gameActive){
            if(energy.value >= 200 ){
                this.gameActive = false
                jsong.continue()
            }
        }
        if(gamePhase.value === 'capture' && this.gameActive){

            const r = this.boss.rotation
            if(r < 0.25 && r > -1){
                // const fx = this.boss.postFX.addGlow(0xffffff, 0, 0, false, 0.1, 32)
            }
            else{
                
            }

            if(this.player.y >= 256+16 && this.player.active ){
                this.gameActive = false
                this.playerReset()
                this.player.visible = false
                this.allowMove = false
                jsong.continue()
            }
        }
        if(gamePhase.value === 'kill' && this.gameActive){
            if(killCount.value >= killTarget.value ){
                this.gameActive = false
                killCount.value = 0
                this.allowMove = false
                this.player.setVelocity(0)
                this.player.setAcceleration(0)
                this.player.setGravity(0)
                jsong.continue()
                this.animateDespawn().then(()=>{
                })
            }
        } 
    }
}



onMounted(()=>{
    jsong.addEventListener('queue',(ev)=>{
        const timeTo = ev.timeUntil * 1000
        const s = game.value.scene.getScene('game')
        if(ev.to?.name === 'bridge1') {
            s.animateDespawn(timeTo/2).then(()=>{
                s.createCapture(timeTo/2)
            })
            console.log("changing to bridge1 CAPTURE",timeTo)
        }
    })
    jsong.addEventListener('change',(ev)=>{
        console.log("ev",ev.to, ev.from)
        const s = game.value.scene.getScene('game')
        if(ev.to?.name === 'avoid' && ev.from?.name !== 'idle') s.createAvoid()
        if(ev.to?.name === 'bridge1end') s.createKill()
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
        scene: Game
    });
    canvas.value.style = 'width: 100vmin; height: 100vmin; image-rendering: pixelated;'
    gamePhase.value = 'avoid'
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
        <div v-if="gamePhase === 'avoid'"> Collect 200 energy</div> 
        <div v-if="gamePhase === 'kill'"> {{ killCount }}/{{killTarget}} </div> 
        <div :style="{'--value':energy / 200}" class="bar right">energy {{ energy }}</div>
    </section>
    <section class="song-status bg-green-900 fixed z-50 bottom-0 left-0 right-0 flex">
        JSONg:
         {{jsong.current?.name}}
         {{jsong?.state}}
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

.canvas.transition {
    transition: filter 3s;
}
.canvas.fade{
    filter: brightness(0);
    transition: filter 3s;
}

</style>