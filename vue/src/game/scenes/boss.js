import Phaser from "phaser";
import PlayerController from "../player";
import { EventBus } from "../events";

export default class Boss extends PlayerController {

    powers;

    boss;
    enemyLasers;
    playerLasers;

    gameActive = true

    constructor(){
        super('boss')
    }

    preload ()
    {   
        super.preload()

        this.load.image('enemy1',"enemy1.png")
        this.load.image('bullet0',"bullet0.png")
        this.load.image('bullet1',"bullet1.png")
        this.load.image('bullet2',"bullet2.png")
    }
    create ()
    {
        super.create()

        this.enemyLasers = this.physics.add.group()
        this.playerLasers = this.physics.add.group()
        this.boss = this.physics.add.staticImage(128, 128, 'enemy1')

        this.boss.scale = 0
        this.tweens.add({
            targets: this.boss,
            scale: '+=1',
            duration: 2000,
        })

        this.playerAnimateFlyin(2000).then(()=>{
            
            this.physics.add.collider(this.player, this.boss)
            this.physics.add.overlap(this.player, this.boss, this.playerCollide)
            this.physics.add.overlap(this.boss, this.playerLasers, this.enemyHit, null, this);
            this.physics.add.overlap(this.player, this.enemyLasers, this.playerHit, null, this);
            
            this.tweens.add({
                targets: this.boss,
                scale: '-=0.2',
                duration: 2000,
                yoyo: true,
                repeat: -1
            })

            this.time.addEvent({
                delay: 1500,
                duration: 1000,
                repeat: -1,
                callback: ()=>{
                    if(!this.boss.visible) return
                    const enemy = this.boss
                    const r = this.enemyLasers.create(enemy.x, enemy.y,'bullet2')
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y); 
                    this.physics.velocityFromRotation(angle, 50, r.body.velocity)
                    r.setAngularVelocity(-70 + Math.random() * 200)
                }
            })
            this.time.addEvent({
                delay: 1000,
                repeat: -1,
                callback: ()=>{
                    if(!this.boss.visible) return
                    const enemy = this.boss
                    const r = this.enemyLasers.create(enemy.x, enemy.y,'bullet1')
                    const angle = Phaser.Math.Angle.Random(); 
                    this.physics.velocityFromRotation(angle, 80, r.body.velocity)
                    r.setAngularVelocity(-70 + Math.random() * 200)
                }
            })
            
            EventBus.emit('current-scene-ready',this)
            EventBus.on('end-scene',(duration = 2000)=>{
                this.playerAnimateDespawn(2000).then(()=>{
                    EventBus.emit('current-scene-end',this)
                })
                EventBus.removeListener('end-scene')
            })
            EventBus.on('player-dead' ,()=>{
                this.playerAnimateExplode()
            })
            EventBus.on('boss-dead' ,()=>{
                this.boss.visible = false
                this.boss.body.checkCollision.none = true
                this.explosion.visible = true;
                this.explosion.x = 128
                this.explosion.y = 128
                this.explosion.setScale(0,0)
                this.tweens.add({
                    targets: this.explosion,
                    scale: '+=1',
                    duration: 2000,
                    ease: 'Sine.inOut',
                    yoyo: true,
                }); 
                this.explosion.anims.play('player-explode');
            })
        })


    }

    fireBullet(){
        // const xx = this.input.activePointer.x
        // const yy = this.input.activePointer.y
        const xx = 128
        const yy = 128
        const r = this.playerLasers.create(this.player.x, this.player.y,'bullet0')
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, xx, yy); 
        this.physics.velocityFromRotation(angle, 70, r.body.velocity)
        r.setAngularVelocity(-70 + Math.random() * 200)

        EventBus.emit('player-fire-bullet')
    }


    playerCollide(player, bullet){
        
    }
    playerHit(_player, bullet){
        EventBus.emit('player-hit')
        bullet.destroy()
        this.player.active = false
        this.player.setAccelerationX(0)
        this.player.setAccelerationY(0)
        this.time.addEvent({
            delay:500,
            callback: ()=>{
                this.player.active = true
            }
        })
    }
    enemyHit(enemy, bullet){
        bullet.destroy()
        if(enemy.visible)
            EventBus.emit('enemy-hit')
    }

    update(){
        if(!this.gameActive) return

        if(this.player.active)
            this.playerMovement() 
        
        if(!this.cursors.space.isDown ){
            this.down = false;
            this.fireTimer?.destroy()
        }
        if(this.cursors.space.isDown && !this.down){
            if(this.fireTimer?.getRemaining() > 0) return
            this.down = true;
            this.fireBullet()
            this.fireTimer =  this.time.addEvent({
                delay: 200,
            })
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

