import Phaser from "phaser";

export default class PlayerController extends Phaser.Scene {
    cursors;
    player;
    portal;    
    explosion;

    preload(){
        this.load.spritesheet('player',
            "rocket.png",
            { frameWidth: 16, frameHeight: 32}
        );

        this.load.spritesheet('explode',
            "explode.png",
            { frameWidth: 72, frameHeight: 72}
        );

        this.load.image('wormhole',"wormhole.png")
    }

    create(){ 
        this.input.mouse.disableContextMenu();
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.portal = this.physics.add.sprite(128,-128,'wormhole')
        this.portal.visible = false;

        this.player = this.physics.add.sprite(128, -128, 'player').setOrigin(0.5,0.25)
        this.player.setCollideWorldBounds(false);
        this.player.setBounce(0.25,0.25)
        this.player.setCircle(8)
        this.player.active = false
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
    }

    changeScene(to){
        this.scene.start(to);
    }

    playerMovement(){
        if(this.cursors.up.isDown){ 
            this.player.setAccelerationY(-100);
        }
        else if(this.cursors.down.isDown){ 
            this.player.setAccelerationY(100);
        }
        else 
        this.player.setAccelerationY(0);

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
        this.player.setVelocityY(-0.001)
    }

    playerAnimateFlyin(duration = 1500){
        return new Promise((res)=>{
        this.playerReset()
        this.player.active = false
        this.player.setCollideWorldBounds(false)
        this.player.setPosition(128,256+32)
        const t = this.tweens.add({
            targets: this.player,
            y: '-=64',
            duration: duration/2,
            ease: 'Sine.inOut',
        }); 
        const r = this.time.addEvent({
            delay: duration,
            callback: ()=>{
                this.player.setCollideWorldBounds(true)
                this.player.active = true
                res(true)
            }
        })
        })
    }

    playerAnimateSpawn(duration = 4000){
        return new Promise((res)=>{
        this.portal.visible = true
        this.player.active = false
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
                this.player.active = true
                res(true)
            }
        })
        })
    }


    playerAnimateDespawn(duration = 4000){
        return new Promise((res)=>{
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
        const r = this.time.addEvent({
            delay: duration,
            callback: ()=>{
                res(true)
            }
        })
        })
    }

    playerAnimateExplode(duration = 2000){ 
        return new Promise((res)=>{
        
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
        this.player.anims.play('player-explode');
        this.playerReset()
        this.player.visible = false;
        this.player.active = false; 
        this.player.body.checkCollision.none = true
        this.time.addEvent({
            delay: duration,
            callback: ()=>{
                res(true)
            }
        })
        
        })
    }

}
