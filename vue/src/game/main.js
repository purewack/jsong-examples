import Phaser from 'phaser';
import Avoid from './scenes/avoid';
import Shoot from './scenes/shoot';
import PlayerControlScene from './player';
import Boss from './scenes/boss';

const config = {
    type: Phaser.AUTO,
    width: 256,
    height: 256,
    parent: 'game-container',
    backgroundColor: '#028af8',
    // transparent: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x:0 },
            debug: true
        }
    },
    scene: [
        Avoid,
        Shoot,
        Boss
    ]
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
}

export default StartGame;