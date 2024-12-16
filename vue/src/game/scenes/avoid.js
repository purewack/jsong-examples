import Phaser from "phaser";
import PlayerController from "../player";
import { EventBus } from "../events";

export default class Avoid extends PlayerController {

    powers;
    obstacles;

    gameActive = true;
    playerAllowMove = false;

    constructor(){
        super({key:'avoid'})
    }

    preload ()
    {   
        super.preload()

        this.load.image('power',"power0.png")
        this.load.image('obstacle0',"obs0.png")
        this.load.image('obstacle1',"obs1.png")
    }
    create ()
    {
        super.create()

        const wallL = this.physics.add.staticBody(-1,-1000,1,2000)
        const wallR = this.physics.add.staticBody(256,-1000,1,2000)
   
        this.obstacles = this.physics.add.group()
        this.powers = this.physics.add.group()
       
        this.physics.add.collider(this.powers, wallL)
        this.physics.add.collider(this.powers, wallR)
        this.physics.add.collider(this.powers, this.powers)
        this.physics.add.collider(this.obstacles, this.obstacles)
        this.physics.add.collider(this.powers, this.obstacles)

        this.physics.add.collider(this.player, this.obstacles, this.playerCollideRock)
        this.physics.add.overlap( this.player, this.powers, this.collectPower, null, this);


        this.player.setVelocityY(-0.01)
        this.player.setPosition(128,256+32)
        this.player.setCollideWorldBounds(false)
        this.playerAnimateSpawn(2000).then(()=>{
            this.player.setCollideWorldBounds(true)
            this.player.setVelocityY(-0.01)
            this.playerAllowMove = true

            for(let i=2; i<12+2; i++){
                this.time.addEvent({
                    delay: 700 * i,
                    callback: ()=>{
                        this.randomRock()
                    }
                });
            }

            for(let i=2; i<3+2; i++){
                this.time.addEvent({
                    delay: 2000 * (i+2),
                    callback: ()=>{
                        this.randomPower()
                    }
                });
            }
        })

        this.gameActive = true
        EventBus.emit('current-scene-ready',this)
        EventBus.on('end-scene' ,(duration = 2000)=>{
            this.gameActive = false
            this.tweens.add({
                targets:this.obstacles.getChildren(),
                scale: '-=1',
                duration: 2000,
            })
            this.tweens.add({
                targets:this.powers.getChildren(),
                scale: '-=1',
                duration: 2000,
            })
            
            this.playerAnimateDespawn(2000).then(()=>{
                EventBus.emit('current-scene-end',this)
            })
            EventBus.removeListener('end-scene')
        })
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
    randomPower(){
        const r = this.powers.create(256*Math.random(),-32,'power')
        r.setCircle(8)
        r.setBounce(1,1)
        r.setVelocityY(10 + 20*Math.random())
        r.setVelocityX((10*Math.random()) - 5)
        r.setAngularVelocity(-70 + Math.random() * 200)
    }
 

    collectPower(player, item){
        item.destroy()
        this.time.addEvent({
            delay: 2000,
            callback: ()=>{
                this.randomPower()
            }
        });

        EventBus.emit('player-collect-power')
    }

    playerCollideRock(player, item){
        EventBus.emit('player-hit')
    }


    update(){
        if(!this.gameActive) return

        if(this.playerAllowMove)
            this.playerMovement()

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
    }
}
