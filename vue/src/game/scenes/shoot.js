import { EventBus } from "../events";
import PlayerController from "../player";

export default class Shoot extends PlayerController{

    playerLasers;
    enemyLasers;
    enemies;
    powers;
    gameActive = false;

    constructor(){
        super('shoot')
    }

    preload(){
        this.load.image('bullet0','bullet0.png')
        this.load.image('bullet1','bullet1.png')
        this.load.image('bullet2','bullet2.png')
        this.load.image('enemy0', 'enemy0.png')
    }

    create(){
        super.create()

        this.powers = this.physics.add.group()
        this.enemies = this.physics.add.group()
        this.enemyLasers = this.physics.add.group()
        this.playerLasers = this.physics.add.group()

        this.physics.add.overlap(this.player, this.powers, this.collectPower, null, this);
        this.physics.add.collider(this.player, this.enemies, this.enemyHit);
        
        this.physics.add.overlap(this.player, this.enemyLasers, this.playerHit, null, this);
        this.physics.add.overlap(this.playerLasers, this.enemies, this.enemyHit, null, this);
        
        const wallL = this.physics.add.staticBody(-1,-1000,1,2000)
        const wallR = this.physics.add.staticBody(256,-1000,1,2000)

        this.physics.add.collider(this.enemies, wallL)
        this.physics.add.collider(this.enemies, wallR)

        this.player.setCollideWorldBounds(false)
        this.playerAnimateSpawn(2000).then(()=>{
            this.player.setCollideWorldBounds(true)
            this.player.active = true
            this.gameActive = true
    
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

            for(let i=2; i<9+2; i++){
                this.time.addEvent({
                    delay: 700 * i,
                    callback: ()=>{
                        this.randomEnemy()
                    }
                });
            }

            this.randomPower()
            this.randomPower()

            this.time.addEvent({
                delay: 15000,
                repeat: -1,
                callback: ()=>{
                    this.randomPower()
                }
            })
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
    }

    update(){
        if(!this.gameActive) return

        if(this.player.active)
            this.playerMovement() 
        
        if(!this.input.activePointer.buttons ){
            this.down = false;
            this.fireTimer?.destroy()
        }
        if(this.input.activePointer.buttons && !this.down){
            if(this.fireTimer?.getRemaining() > 0) return
            this.down = true;
            if(!this.cursors.shift.isDown)
                this.fireBullet()
            else
                this.fireBurst()
            this.fireTimer =  this.time.addEvent({
                delay: this.cursors.shift.isDown ? 1000 : 200,
            })
        }


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

    playerHit(_player, bullet){
        bullet.destroy()
        if(_player.active)
            EventBus.emit('player-hit')
    }
    enemyHit(checker, bullet){
        if(checker.texture.key !== 'player'){
            bullet.destroy()
            checker.destroy()
            this.randomEnemy()
        }
        EventBus.emit('enemy-hit')
    }

    collectPower(player,power){
        power.destroy()
        EventBus.emit('player-collect-power')
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

        // const maxSpeed = 10 + 50 * Math.min(this.killCount / this.killTarget,100)
        const maxSpeed = 30
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
       
        r.setBounce(1,1)
    }

    fireBullet(){
        const xx = this.input.activePointer.x
        const yy = this.input.activePointer.y
        const r = this.playerLasers.create(this.player.x, this.player.y,'bullet0')
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, xx, yy); 
        this.physics.velocityFromRotation(angle, 70, r.body.velocity)
        r.setAngularVelocity(-70 + Math.random() * 200)

        EventBus.emit('player-fire-bullet')
    }

    fireBurst(){
        const xx = this.input.activePointer.x
        const yy = this.input.activePointer.y
        const r = this.playerLasers.createMultiple({
            key: 'bullet1',
            setXY: { x: this.player.x, y: this.player.y },
            repeat: 6,
        })
        const offset = Math.random() * Math.PI
        r.forEach((c,i) => {
            c.angle = (i/(r.length-1 )) * Math.PI*2 + offset
            this.physics.velocityFromRotation(c.angle, 50, c.body.velocity)
        })

        EventBus.emit('player-fire-burst')
    }
}